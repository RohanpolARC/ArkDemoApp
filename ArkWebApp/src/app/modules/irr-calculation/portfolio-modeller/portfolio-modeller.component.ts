import { ColumnFilter, AdaptableOptions, AdaptableApi, AdaptableButton, ActionColumnContext } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, EditableCallbackParams, GridOptions, RowNode, CellValueChangedEvent, GridReadyEvent, GridApi, Module, CellClassParams, FirstDataRenderedEvent } from '@ag-grid-community/core';
import { Component, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject, Subscription, timer } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { removeDecimalFormatter, formatDate, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER } from 'src/app/shared/functions/formatter';
import { IRRCalcParams, MonthlyReturnsCalcParams, PerfFeesCalcParams, PortfolioModellerCalcParams, VPortfolioLocalOverrideModel } from 'src/app/shared/models/IRRCalculationsModel';
import { EventEmitter } from '@angular/core';
import { AggridMaterialDatepickerComponent } from '../../facility-detail/aggrid-material-datepicker/aggrid-material-datepicker.component';
import { PortfolioSaveRunModelComponent } from '../portfolio-save-run-model/portfolio-save-run-model.component';
import { getLastBusinessDay, getMomentDateStr, presistSharedEntities, loadSharedEntities, autosizeColumnExceptResized } from 'src/app/shared/functions/utilities';
import { CommonConfig } from 'src/app/configs/common-config';
import { first, switchMap, takeUntil } from 'rxjs/operators';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { getNodes } from '../../capital-activity/utilities/functions';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

type TabType =  `IRR` | `Monthly Returns` | `Performance Fees`

type EmitParams = {
  parentDisplayName: string,
  tabs:{
    tabName: string,
    tabType: TabType,
    calcParams: IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesCalcParams
  }[]
}
export type LoadStatusType = `Loading` | `Loaded` | `Failed`;
let adaptable_Api: AdaptableApi

@Component({
  selector: 'app-portfolio-modeller',
  templateUrl: './portfolio-modeller.component.html',
  styleUrls: ['./portfolio-modeller.component.scss']
})
export class PortfolioModellerComponent implements OnInit {
  closeTimer: Subject<any> = new Subject<any>();
  benchMarkIndexes: string[];
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';
  
  constructor(
    private dataSvc: DataService,
    private irrCalcService: IRRCalcService,
    public dialog: MatDialog
  ) { }

  @Output() calcParamsEmitter = new EventEmitter<EmitParams>();

  multiSelectPlaceHolder: string = null;
  dropdownSettings: IDropdownSettings = null;
  selectedDropdownData: any = null;

  asOfDate: string = getMomentDateStr(getLastBusinessDay())
  selectedModelID: number
  isAutomatic: FormControl
  isLocal: FormControl

  subscriptions: Subscription[] = [];
  rowData = []
  modelData: {
    modelID: number, modelName: string, displayName: string, modelDesc: string, 
    rules: ColumnFilter[], positionIDs: number[], 
    isLocal: boolean, isManual: boolean, username: string, isShared: boolean, aggregationType: string
  }[]
  modelMap = {} //<id, model Object>
  selectedPositionIDs: number[] = []
  localOverrides

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES

  // Mapping visible columns against their local and global counterparts.
  overrideColMap: {
    [col: string] : {
      local: string, global: string
    }
  } = {
    expectedPrice: { local: 'localExpectedPrice', global: 'globalExpectedPrice' },
    expectedDate: { local: 'localExpectedDate', global: 'globalExpectedDate' },
    positionPercent: { local: 'localPositionPercent', global: 'globalPositionPercent' },
    spreadDiscount: { local: 'localSpreadDiscount', global: 'globalSpreadDiscount' },
    maturityDate: { local: 'localMaturityDate', global: 'globalMaturityDate' },
    benchMarkIndex: { local: 'localBenchMarkIndex', global: 'globalBenchMarkIndex' },
    spread: { local: 'localSpread', global: 'globalSpread' },
    pikMargin: { local: 'localPikMargin', global: 'globalPikMargin' },
    unfundedMargin: { local: 'localUnfundedMargin', global: 'globalUnfundedMargin' },
    floorRate: { local: 'localFloorRate', global: 'globalFloorRate' },
  }

  editableCellStyle = (params: CellClassParams) => {
    if(params.node.group)
      return null;

    let colID: string = params.column.getColId();
    let row = params.data;
    if(this.isLocal.value && Object.keys(this.overrideColMap).includes(colID)){
      if(row[colID] !== row[this.overrideColMap[colID].global]){
        if(row[colID] === row[this.overrideColMap[colID].local])
          // Saved override value
          return {
            borderColor: '#0590ca',
            backgroundColor: '#f79a28'
          }
          // Dirty override value
        else return {                   
          borderColor: '#0590ca',
          backgroundColor: '#ffcc00'
        }
      }
      else
        // No override 
        return { 
          borderColor: '#0590ca'
        }     
    }

    return null;
  }

  isEditable = (params: EditableCallbackParams) => {
    return this.isLocal.value
  }

  AMOUNT_COLUMNS = [
    'maturityPrice',
    'expectedPrice',
    'floorRate',
    'faceValueIssue',
    'costPrice',
    'mark',
    'adjustedEBITDAatInv',
    'ebitda',
    'ltmRevenues',
    'netLeverage',
    'netLeverageAtInv',
    'netLTV',
    'netLTVatInv',
    'revenueatInv',
    'revenuePipeline',
    'reportingEBITDA',
    'reportingNetLeverage',
    'unfundedMargin',
  'floorRate']

  columnDefs: ColDef[] = [    
  {field: 'positionID', width:100, tooltipField: 'positionID', type:'abColDefNumber'},
  {field: 'fundHedging', width:150, tooltipField: 'fundHedging', rowGroup: true, pinned: 'left', type: 'abColDefString'}, 
  {field: 'issuerShortName', width: 170, tooltipField: 'issuerShortName', rowGroup: true, pinned: 'left', type: 'abColDefString'},
  {field: 'asset', width: 240, tooltipField: 'asset', type: 'abColDefString'},
  {field: 'assetID', width: 103, type:'abColDefNumber'},
  {field: 'assetTypeName', width: 153, type: 'abColDefString'},
  {field: 'fund', width: 150, tooltipField: 'fund', type: 'abColDefString'},
  {field: 'ccy', width: 80, type: 'abColDefString'},
  {field: 'faceValueIssue', cellClass: 'ag-right-aligned-cell', width: 150, type:'abColDefNumber'},
  {field: 'costPrice',  cellClass: 'ag-right-aligned-cell', width: 110, type:'abColDefNumber'},
  {field: 'mark',  cellClass: 'ag-right-aligned-cell', width: 86, type:'abColDefNumber'},
  {field: 'maturityDate', type: 'abColDefDate', width: 135, cellClass: 'dateUK', 
    editable: this.isEditable.bind(this),
    cellStyle: this.editableCellStyle.bind(this), cellEditor: 'agGridMaterialDatepicker'},
  {field: 'benchMarkIndex', width: 161, type: 'abColDefString',     editable: this.isEditable.bind(this),
  cellStyle: this.editableCellStyle.bind(this),
  cellEditor: 'autocompleteCellEditor',
  // This function will return when required and not on columndef init only
  cellEditorParams: () => { 
    return {
      options: this.benchMarkIndexes,
      isStrict: true,
      oldValRestoreOnStrict: true
  }}},
  { 
    field: 'spread', width: 94, cellClass: 'ag-right-aligned-cell', valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
    editable: this.isEditable.bind(this),
    cellStyle: this.editableCellStyle.bind(this)
  },
  {
    field: 'pikMargin', width: 120, headerName: 'PIK Margin', cellClass: 'ag-right-aligned-cell', valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
    editable: this.isEditable.bind(this),
    cellStyle: this.editableCellStyle.bind(this)
  },
  {
    field: 'unfundedMargin', width: 160,  cellClass: 'ag-right-aligned-cell', type:'abColDefNumber'
    ,editable: this.isEditable.bind(this),
    cellStyle: this.editableCellStyle.bind(this)
  },
  {
    field: 'floorRate', width: 113,  cellClass: 'ag-right-aligned-cell', type:'abColDefNumber',
    editable: this.isEditable.bind(this),
    cellStyle: this.editableCellStyle.bind(this)
  },
  { field: 'dealType',
    type: 'abColDefString',
  },
  { 
    field: 'dealTypeCS',
    type: 'abColDefString'
  },
  { field: 'expectedDate', maxWidth: 150, width: 150, type: 'abColDefDate', cellEditor: 'agGridMaterialDatepicker',
    editable: this.isEditable.bind(this),
    cellStyle: this.editableCellStyle.bind(this),
    cellClass: 'dateUK'
  },
  { field: 'expectedPrice', width: 140,  cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber',
    editable: this.isEditable.bind(this),
    cellStyle: this.editableCellStyle.bind(this)
  },
  { field: 'maturityPrice', width: 136, cellClass: 'ag-right-aligned-cell', type:'abColDefNumber' },
  { headerName: 'Spread Discount', width: 151, field: 'spreadDiscount', valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
    editable: this.isEditable.bind(this),
    cellStyle: this.editableCellStyle.bind(this)
  },
  { field: 'positionPercent', width: 150, headerName: 'Position Percent', valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
    editable: this.isEditable.bind(this),
    cellStyle: this.editableCellStyle.bind(this)
  },
  { field: 'adjustedEBITDAatInv',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Adj EBITDA at Inv' },
  { field: 'ebitda',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'EBITDA' }, 
  { field: 'ltmRevenues',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'LTM Revenues' },
  { field: 'netLeverage',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Net Leverage' },
  { field: 'netLeverageAtInv',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Net Leverage At Inv' },
  { field: 'netLTV',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Net LTV' },
  { field: 'netLTVatInv',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Net LTV at Inv' },
  { field: 'revenueatInv',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Revenue at Inv' },
  { field: 'revenuePipeline',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Revenue Pipeline' },
  { field: 'reportingEBITDA',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Reporting EBITDA' },
  { field: 'reportingNetLeverage',  type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', headerName: 'Reporting Net Leverage' },
  { field: 'reportingNetLeverageComment', type: 'abColDefString', headerName: 'Reporting Net Leverage Comment' },

  { field: 'assetClass', width: 145 ,type: 'abColDefString'},
  { field: 'capStructureTranche', width: 145 ,type: 'abColDefString'},
  { field: 'securedUnsecured', width: 145 ,type: 'abColDefString'},
  { field: 'seniority', width: 145 ,type: 'abColDefString'},
  { field: 'IsChecked', width: 50, headerName: 'Checked', type: 'abColDefBoolean', checkboxSelection: true },
  { field: 'isOverride', width: 150, headerName: 'IsOverride', type: 'abColDefString' },
  { field: 'clear_override', width: 50, headerName: 'Override', type: 'abSpecialColumn' }
]

  autoGroupColumnDef: {
    pinned: 'left',
    cellRendererParams: {
      suppressCount: true     // Disable row count on group
    }
  }
  gridOptions: GridOptions;
  gridApi: GridApi;
  adapTableApi: AdaptableApi;
  adaptableOptions: AdaptableOptions;

  getDateFields(row: any, fields: string[]){
    for(let i = 0; i < fields.length; i+= 1){
      row[fields[i]] = formatDate(row[fields[i]]);
      if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(row[fields[i]]))
        row[fields[i]] = null;
    }

    return row;
  }

  // Get the override flag value for the row.
  getIsOverride(row: any){
    let cols: string[] = Object.keys(this.overrideColMap)
    let isOverride: boolean = false;
    for(let i = 0 ; i < cols.length; i+= 1){
      isOverride = isOverride || (row[cols[i]] !== row[this.overrideColMap[cols[i]].global])
    }

    return isOverride ? 'Yes' : 'No';
  }

  fetchIRRPostions() {
    if(this.asOfDate !== null){
      this.gridOptions?.api?.showLoadingOverlay();
      this.subscriptions.push(this.irrCalcService.getIRRPositions(this.asOfDate, this.selectedModelID).subscribe({
        next: data => {
          if(data.length === 0){
            this.noRowsToDisplayMsg = 'No data found for applied filter.'
          }
          this.gridOptions?.api?.hideOverlay();
          for(let i: number = 0; i < data?.length; i+= 1){
            data[i] = this.getDateFields(data[i], [
              ...['expectedDate', 'localExpectedDate', 'globalExpectedDate'], 
              ...['maturityDate', 'localMaturityDate', 'globalMaturityDate']])
            data[i]['isOverride'] = this.getIsOverride(data[i])
          }  
          adaptable_Api.gridApi.setGridData(data)
          if(this.selectedModelID){
            if(this.modelMap[this.selectedModelID].positionIDs){

              this.gridApi.deselectAll();
              this.modelMap[this.selectedModelID].positionIDs?.forEach(posID => {
                let node: RowNode = <RowNode>adaptable_Api.gridApi.getRowNodeForPrimaryKey(posID)
                node.setSelected(true);
                this.selectedPositionIDs = this.modelMap[this.selectedModelID].positionIDs
              })
            }
          
            this.selectManualPositions(this.selectedModelID);
          }

          // Refreshing clear_override column based on dataset
          adaptable_Api.gridApi.refreshCells(adaptable_Api.gridApi.getAllRowNodes(), ['clear_override']);

        },
        error: error => {
          this.rowData = []
          this.gridOptions?.api?.showNoRowsOverlay();
          console.error(`Failed to fetch positions data: ${error}`);
        }
      }))
  
    }
  }

  createNewTabGroup(runID: string, context: string[] = ['SaveRunIRR'], contextData: {  //changes context type from string to string[]
    baseMeasure?: string,
    feePreset?: string,
    irrAggrType?: string,
    curveRateDelta?: number,
    aggrStr?: string[],
    mapGroupCols?: string[]
  }){
    let calcParamsData = []

    //Set calculation param configs and open all the tabs first
    context.forEach(e => {
        switch (e) {

          case 'SaveRunPFees':
            calcParamsData.push({ runID: runID, type: 'Performance Fees', feePreset: contextData?.feePreset })
            break;
          case 'SaveRunMReturns':
            calcParamsData.push({ runID: runID, type: 'Monthly Returns', baseMeasure: contextData?.baseMeasure })
            break;  
          case 'SaveRunIRR':
            calcParamsData.push({ runID: runID, type: 'IRR', aggrStr: contextData?.aggrStr, mapGroupCols: contextData?.mapGroupCols, curveRateDelta: contextData.curveRateDelta})
            break;
          default:
            break;
        }
    });

    // This will create new tab configs and will emit the config for new tab config to IRR Calculation component. 
    this.multiCalculationStaging(this.modelMap[this.selectedModelID]?.modelName, calcParamsData)
  }

  saveModelCashflowsAndOpenTabs(modelID?: number, context: string[] = ['SaveRunIRR'], contextData: {  //changes context type from string to string[]
    baseMeasure?: string,
    feePreset?: string,
    irrAggrType?: string,
    curveRateDelta?: number,
    aggrStr?: string[],
    mapGroupCols?: string[]
  } = null){

    if(!modelID)
      console.error(`Model ID not received`)

    // Create params for generating cashflows and trigger the virtual model cashflow generator
    let m = <PortfolioModellerCalcParams> {};
    m.modelID = modelID;
    m.positionIDs = this.selectedPositionIDs;
    m.asOfDate = this.asOfDate;
    m.feePreset = contextData.feePreset;
    m.irrAggrType = contextData?.aggrStr?.join(' > ') ?? '';
    m.curveRateDelta = contextData.curveRateDelta ?? 0.0;
    m.runBy = this.dataSvc.getCurrentUserName();

    // Load cashflows only if running IRR/Performance fees

    if(context.includes('SaveRunIRR') || context.includes('SaveRunPFees')){
    
      this.irrCalcService.generatePositionCashflows(m).pipe(first()).subscribe({
        next: resp => {

          let runID: string = resp?.['id'];
          this.irrCalcService.terminateCashflowSaveUri = resp?.['terminatePostUri'];

          // After save cashflows instance is registered, setting a new tab for the run.
          this.createNewTabGroup(runID, context, contextData)

          this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Loading' })

          timer(0, 10000).pipe(
            switchMap(() => this.irrCalcService.getIRRStatus(resp?.['statusQueryGetUri'])),
            takeUntil(this.closeTimer)
          ).subscribe({
            next: (res: any) => {

              if(res?.['runtimeStatus'] === 'Completed'){

                this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Loaded' })
                this.dataSvc.setWarningMsg(`Generated ${res['output']['cashflowCount']} cashflows for the selected model`, `Dismiss`, `ark-theme-snackbar-normal`);
                this.closeTimer.next();
              }
              else if(res?.['runtimeStatus'] === 'Terminated'){
                this.closeTimer.next();
              }
              else if(res?.['runtimeStatus'] === 'Failed'){

                this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Failed' })               
                this.dataSvc.setWarningMsg(`Failed to generate the cashflows`, `Dismiss`, `ark-theme-snackbar-error`);
                this.closeTimer.next();
              }
            },
            error: (error) => {
              this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Failed' });
              console.error(`Error in saving cashflows to DB: ${error}`);
              this.closeTimer.next();
            }
          })
        },
        error: error => {
          this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: null, status: 'Failed' });
          console.error(`Error in saving cashflows to DB: ${error}`);
          this.closeTimer.next();
        } 
      })

    }
    else if(context?.length === 1 && context.includes("SaveRunMReturns")){
      this.createNewTabGroup(null, context, contextData)
    }


  }

  fetchPortfolioModels(modelID?: number, context: string[] = ['SaveRunIRR'], contextData: {  //changes context type from string to string[]
    baseMeasure?: string,
    feePreset?: string,
    irrAggrType?: string,
    curveRateDelta?: number,
    aggrStr?: string[],
    mapGroupCols?: string[]
  } = null){
    this.subscriptions.push(this.irrCalcService.getPortfolioModels(this.dataSvc.getCurrentUserName()).subscribe({
      next: data => {
        this.parseFetchedModels(data);
        this.InitModelMap()
        this.setSelectedModel(modelID)

        if(modelID)
        this.saveModelCashflowsAndOpenTabs(modelID, context, contextData);

      },
      error: error => {
        console.error(`Failed to fetch Portfolio Rules: ${error}`)
      }
    }))
  }


  InitModelMap(){
    this.modelMap = {};

    for(let i = 0 ; i < this.modelData.length; i+= 1){
      if(!this.modelMap.hasOwnProperty(this.modelData[i].modelID)){
        this.modelMap[this.modelData[i].modelID] = this.modelData[i];
      }
    }
  }

  context

  fetchUniqueBenchmarkIndexes(){
    this.subscriptions.push(this.dataSvc.getUniqueValuesForField('BenchMark Index').subscribe(d => {
      this.benchMarkIndexes = d.map((bmIdx) => bmIdx.value);
    }))
  }
  
  ngOnInit(): void {

    this.fetchUniqueBenchmarkIndexes();

    this.isAutomatic = new FormControl()
    this.isLocal = new FormControl()
      // Toggle layout programmatically
    this.isAutomatic.setValue(false)
      // Don't toggle programmatically
    this.isLocal.setValue(false, {emitEvent: false})
    this.context = {
      componentParent: this
    }

    let frameworkComponents = {
      agGridMaterialDatepicker: AggridMaterialDatepickerComponent,
      autocompleteCellEditor: MatAutocompleteEditorComponent
    }

    this.fetchPortfolioModels()

    this.selectedDropdownData = []
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'modelID',
      textField: 'displayName',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      searchPlaceholderText: 'Select Portfolio Model',
      closeDropDownOnSelection: true,

    }
    
    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      context: this.context,
      singleClickEdit: true,
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        filter: true
      },

      rowGroupPanelShow: 'always',
      rowSelection: 'multiple',
      groupSelectsFiltered: true,
      groupSelectsChildren: true,
      suppressRowClickSelection: true,
      suppressAggFuncInHeader: true,
      enableGroupEdit: true,
      autoGroupColumnDef: this.autoGroupColumnDef,
      components: frameworkComponents,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent:NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'positionID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'IRR Calc - positions',
      adaptableStateKey: 'IRR Calc key',
      
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
  
      },

      userInterfaceOptions: {
        dateInputOptions: {
          dateFormat: 'dd/MM/yyyy',
          locale: 'en-GB'
        },
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',[...this.AMOUNT_COLUMNS]),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('customDateFormat',['expectedDate', 'localExpectedDate', 'globalExpectedDate','maturityDate', 'localMaturityDate', 'globalMaturityDate'])
        ]
      },

      layoutOptions: {
        autoSaveLayouts: false
      },

      actionOptions: {
        actionColumns: 
        [{
            columnId: 'clear_override',
            friendlyName: ' ',
            includeGroupedRows: true,
            actionColumnSettings: {
              suppressMenu: true,
              suppressMovable: true,
              resizable: true
            },
            actionColumnButton: [
              {
                onClick:(
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                ) => {
                  let node: RowNode = <RowNode>context.rowNode;
                  let rowData = getNodes(node)
                  let oCols: string[] = Object.keys(this.overrideColMap);
                  for(let i: number = 0; i < rowData?.length; i++){
                    for(let j: number = 0; j < oCols?.length; j+= 1){
                      rowData[i][oCols[j]] = rowData[i][this.overrideColMap[oCols[j]].global]
                    }
                    rowData[i]['isOverride'] = 'No'
                  }
                  this.gridApi.applyTransaction({
                    update: rowData
                  });
                },
                hidden: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                ) => {
                  let rowData: any = context.rowNode?.data;
                  if(!context.rowNode.group && this.isLocal.value)
                    return rowData?.['isOverride'] === 'Yes' ? false : true;
                  
                    return true;
                },
                tooltip: 'Clear override',
                icon: {
                  src: '../assets/img/cancel.svg',
                  style: {
                    height: 25, width: 25
                  }
                }
              },
              {
                onClick:(
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                ) => {
                  let node: RowNode = <RowNode>context.rowNode;
                  let rowData = getNodes(node)
                  let oCols: string[] = Object.keys(this.overrideColMap);
                  for(let i: number = 0; i < rowData?.length; i++){
                    for(let j: number = 0; j < oCols?.length; j+= 1){
                      rowData[i][oCols[j]] = rowData[i][this.overrideColMap[oCols[j]].local]
                    }
                    rowData[i]['isOverride'] = 'Yes'
                  }
                  this.gridApi.applyTransaction({
                    update: rowData
                  });
                },
                hidden: (
                  button: AdaptableButton<ActionColumnContext>,
                  context: ActionColumnContext
                ) => {
                  let rowData: any = context.rowNode?.data;
                  if(!context.rowNode.group && this.isLocal.value){

                    let isOvrde: boolean = false;
                    let oCols: string[] = Object.keys(this.overrideColMap);

                    oCols.forEach(c => {
                      isOvrde = isOvrde || (rowData[c] !== rowData[this.overrideColMap[c].local]) && (rowData[this.overrideColMap[c].local] !== rowData[this.overrideColMap[c].global])
                    })

                    return isOvrde ? false : true
                  }
                    
                  return true
                },
                tooltip: 'Apply override',
                icon: {
                  src: '../assets/img/redo.svg',
                  style: {
                    height: 25, width: 25
                  }
                }
              }
            ]
          }]
      },


      predefinedConfig: {  
        Dashboard: {
          Revision: 4,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],  
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 16,
          CurrentLayout: 'Manual',
          Layouts: [
          {
            Name: 'Manual',
            Columns: [
              'positionID',
              'fundHedging',
              'issuerShortName',
              'asset',
              'assetID',
              'assetTypeName',
              'fund',
              'ccy',
              'faceValueIssue',
              'costPrice',
              'mark',
              'maturityDate',
              'benchMarkIndex',
              'spread',
              'pikMargin',
              'unfundedMargin',
              'floorRate',
              'dealTypeCS',
              'dealType',
              'expectedDate',
              'expectedPrice',
              'maturityPrice',
              'spreadDiscount',
              'positionPercent',
              'adjustedEBITDAatInv',
              'ebitda',
              'ltmRevenues',
              'netLeverage',
              'netLeverageAtInv',
              'netLTV',
              'netLTVatInv',
              'revenueatInv',
              'revenuePipeline',
              'reportingEBITDA',
              'reportingNetLeverage',
              'reportingNetLeverageComment',
              'assetClass',
              'capStructureTranche',
              'securedUnsecured',
              'seniority',
              'IsChecked',
              'isOverride',
              'clear_override'
            ],
            PinnedColumnsMap: {
              clear_override: 'right',
              IsChecked: 'right'
            },
            RowGroupedColumns: ['fund', 'issuerShortName']
          },
          {
            Name: 'Automatic',
            Columns: [
              'positionID',
              'fundHedging',
              'issuerShortName',
              'asset',
              'assetID',
              'assetTypeName',
              'fund',
              'ccy',
              'faceValueIssue',
              'costPrice',
              'mark',
              'maturityDate',
              'benchMarkIndex',
              'spread',
              'pikMargin',
              'unfundedMargin',
              'floorRate',
              'dealTypeCS',
              'dealType',
              'expectedDate',
              'expectedPrice',
              'maturityPrice',
              'spreadDiscount',
              'positionPercent',
              'adjustedEBITDAatInv',
              'ebitda',
              'ltmRevenues',
              'netLeverage',
              'netLeverageAtInv',
              'netLTV',
              'netLTVatInv',
              'revenueatInv',
              'revenuePipeline',
              'reportingEBITDA',
              'reportingNetLeverage',
              'reportingNetLeverageComment',
              'assetClass',
              'capStructureTranche',
              'securedUnsecured',
              'seniority',
              'isOverride',
              'clear_override'
            ],
            PinnedColumnsMap: {
              clear_override: 'right'
            },
            RowGroupedColumns: ['fund', 'issuerShortName'],
          }]
        },
        FormatColumn:{
          Revision:11,
          FormatColumns:[
            CUSTOM_FORMATTER([...this.AMOUNT_COLUMNS],['amountFormatter']),
            ]
        }
      }

    }
  }

  rows: number[]
  setNodes(node: RowNode, rows: any[] = []){
    /** Get all filtered children nodes recursively (Depth First Search)*/
    if(node.group){
        for(let i = 0; i < node.childrenAfterFilter.length; i+= 1){
            this.setNodes(node.childrenAfterFilter[i], rows);
        }
    }
    else{
        rows.push(node.data.positionID);
    }
    return rows;
  }

  onCellValueChanged(params: CellValueChangedEvent){
    /** Updating all the filtered children nodes as Ag/Adaptable isn't doing itself */
    let node: RowNode = <RowNode>params.node, colID: string = params.column.getColId(), colVal = params.data[colID];

    let updates = [];
    if(node.group){
  
      for(let i: number = 0; i < node.allLeafChildren.length; i++){
       let nodeData = node.allLeafChildren[i].data;
       nodeData[colID] = colVal
       nodeData['isOverride'] = 'Yes'
       updates.push(nodeData)
      }
    }
    else {
      if(node.data[colID] !== node.data[this.overrideColMap[colID].global]){
        let nodeData = node.data
        nodeData['isOverride'] = 'Yes'
        updates.push(nodeData)
      }
    }
    this.gridApi.applyTransaction({ update: updates})

    if(params.node.group){
      let rownodes = params.node.allLeafChildren;
      adaptable_Api.gridApi.refreshCells(rownodes, ['clear_override',...Object.keys(this.overrideColMap), 'isOverride'])
    }
    else 
    adaptable_Api.gridApi.refreshCells([node], ['clear_override',...Object.keys(this.overrideColMap), 'isOverride']);

  }

  getUpdatedValues(): VPortfolioLocalOverrideModel[]{
    let temp: VPortfolioLocalOverrideModel[] = [];

    let gridData = []
    this.gridApi.forEachLeafNode((node) => gridData.push(node.data))

    let oCols: string[] = Object.keys(this.overrideColMap);

    for(let i = 0 ; i < gridData.length; i++){

      for(let j = 0; j < oCols.length; j+=1){

        if(gridData[i][oCols[j]] !== gridData[i][this.overrideColMap[oCols[j]].global])
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: oCols[j],
            value: gridData[i][oCols[j]]
          });
      }
    }
    return temp;
  }

  selectManualPositions(modelID: number){
    this.selectedPositionIDs = []
    if(modelID != null)
      return;

    let positionIDs = this.modelMap[modelID]?.positionIDs
    adaptable_Api?.gridApi?.deselectAll();
    if(positionIDs != null || positionIDs?.length != 0){
      positionIDs.forEachLeafNode(posID => {
        let node: RowNode = <RowNode>adaptable_Api?.gridApi?.getRowNodeForPrimaryKey(posID);
        node.setSelected(posID)
      })
      this.selectedPositionIDs = positionIDs;
    }
    else this.selectedPositionIDs = [];
  }
  
  setSelectedModel(modelID?: number){
    if(modelID){
      this.selectedDropdownData = [
        {
          modelID: modelID,
          displayName: this.modelMap[modelID].displayName
        }]    
    }
    else this.selectedDropdownData = [];
  }

  updateLocalFields(){
    let gridData: any[] = []
    this.gridApi.forEachLeafNode(node => gridData.push(node.data))

    for(let i: number = 0; i < gridData.length; i++){

      let oCols: string[] = Object.keys(this.overrideColMap);
      for(let j: number = 0; j < oCols.length; j+= 1){
        gridData[i][this.overrideColMap[oCols[j]].local] = gridData[i][oCols[j]]
      }
    }

    this.gridApi.applyTransaction({update: gridData})
    this.gridApi.refreshCells({
      force: true,
      suppressFlash: true,
      columns: [ ...Object.keys(this.overrideColMap), 'isOverride'] 
    })
  }

  checkRunningJobs(): number{

    let runningTabs: string[] = this.irrCalcService.parentTabs
                                    ?.filter(tab => tab.status === 'Loading')
                                    ?.map(x => x.parentDisplayName);

    return runningTabs?.length ?? 0;
  }

  onSavePortfolio(context = 'Save'){

    if(this.checkRunningJobs()){

      this.dataSvc.setWarningMsg(`Please wait for the already triggered process to finish`);
      return
    }

    if(this.selectedDropdownData.length === 0 || this.selectedDropdownData === null){
      this.selectedModelID = null
    }

    if(!this.isAutomatic.value){
      this.selectedPositionIDs = this.gridApi.getSelectedNodes()?.map(node => node.data.positionID)
    }
    const dialogRef = this.dialog.open(PortfolioSaveRunModelComponent, {
      data: {
        adaptableApi: adaptable_Api, 
        model: this.modelMap[this.selectedModelID], 
        asOfDate: this.asOfDate, 
        isAutomatic: this.isAutomatic.value, 
        isLocal: this.isLocal.value,
        isShared: this.modelMap[this.selectedModelID]?.isShared,
        positionIDs: this.selectedPositionIDs,
        aggregationType: this.modelMap[this.selectedModelID]?.aggregationType,
        updatedValues: this.getUpdatedValues(),
        context: context
      },
      maxHeight: '100vh',
      width: '80vw',
      maxWidth: '2000px'
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe(res => {
      if(dialogRef.componentInstance?.isSuccess){
        if(this.isAutomatic.value){
          this.selectedPositionIDs = [];
          this.gridApi.forEachNodeAfterFilter(node => 
            {
              if(!!node.data?.positionID)
                this.selectedPositionIDs.push(node.data?.positionID)
            })  
        }
        if(res?.isSuccess){
          this.selectedModelID = dialogRef.componentInstance.modelID
          
          this.fetchPortfolioModels(
            dialogRef.componentInstance.modelID,
            res.context,
            {
              baseMeasure: res?.['baseMeasure'],
              feePreset: res?.['feePreset'],
              irrAggrType: res?.['irrAggrType'],
              curveRateDelta: res?.['curveRateDelta'],
              aggrStr: res?.['aggrStr'],
              mapGroupCols: res?.['mapGroupCols']
            }
          )
          this.updateLocalFields()
        }
      }
    }))
  }

  multiCalculationStaging(parentDisplayName,calcStagingData: {
    runID: string,
    type: TabType,
    baseMeasure?: string,
    feePreset?: string,
    aggrStr?: string[],
    mapGroupCols?: string[],
    curveRateDelta: number
  }[]) {
    let calcParamsEmitterData = []
    
    calcStagingData.forEach((stagingData)=>{
      let _ = this.calculationStaging(stagingData)
      calcParamsEmitterData.push(_)
    })

    this.calcParamsEmitter.emit({
      parentDisplayName: parentDisplayName,
      tabs:calcParamsEmitterData
    })
  }

  calculationStaging(p: {
    runID: string,
    type: TabType,
    baseMeasure?: string,
    feePreset?: string,
    aggrStr?: string[],
    mapGroupCols?: string[],
    curveRateDelta?: number
  }){

    let calcParams
    let tabName: string, tabType: TabType
    if(p.type === 'Monthly Returns'){
      let cp = <MonthlyReturnsCalcParams> {};
      cp.baseMeasure = p.baseMeasure;
      let positionIDsSTR: string = ''
      this.selectedPositionIDs.forEach(posID => {
        positionIDsSTR += String(posID) + ','
      })
      positionIDsSTR = positionIDsSTR.slice(0, -1) // Remove last delimeter

      cp.positionIDs = positionIDsSTR
      calcParams = cp as MonthlyReturnsCalcParams
    }
    else if(p.type === 'Performance Fees'){
      let cp = <PerfFeesCalcParams> {};
      cp.positionIDs = this.selectedPositionIDs;
      cp.feePreset = p.feePreset;
      cp.modelID = this.selectedModelID,


      calcParams = cp as PerfFeesCalcParams
    }
    else if(p.type === 'IRR'){
      let cp = <IRRCalcParams> {};
      cp.positionIDs = this.selectedPositionIDs;
      cp.irrAggrType = this.modelMap[this.selectedModelID]?.irrAggrType;
      cp.modelID = this.isLocal.value ? this.selectedModelID : null,
      cp.aggrStr = p.aggrStr;
      cp.mapGroupCols = p.mapGroupCols;
      cp.curveRateDelta = p.curveRateDelta;

      calcParams = cp as IRRCalcParams
    }


    calcParams.runID = p.runID;
    calcParams.asOfDate = this.asOfDate;
    calcParams.modelName = this.modelMap[this.selectedModelID]?.modelName;

    tabName = p.type
    tabType = p.type;
    let tabData = {calcParams: calcParams, tabName: tabName, tabType: tabType}
    return tabData
  }

  runIRRCalc(){
    this.onSavePortfolio('SaveRunIRR');

  }

  onReset(userAction: boolean = false){
    /** Here, we clear all filters applied on the grid, overrides, toggles etc.*/

    adaptable_Api?.filterApi?.clearColumnFilters();
    

    this.selectedDropdownData = [];
    this.selectedPositionIDs = [];

    if(userAction)
      this.isLocal.setValue(false) 
    else
      this.isLocal.setValue(false, {emitEvent: false})

    this.isAutomatic.setValue(false)
    this.localOverrides = null
    this.selectedModelID = null

    if(adaptable_Api){
      adaptable_Api.filterApi.clearColumnFilters();
      this.gridApi.deselectAll();
      if(userAction)
        this.updateGridOverrides('Clear');
    }
  }

  updateGridWithOverrides(overrideInfo: any){
    for(let i = 0; i < overrideInfo?.length; i+= 1){
      const posID: number = Number(overrideInfo[i].positionID),
            assetID: number = Number(overrideInfo[i].assetID),
            colName: string = overrideInfo[i].key,
            val: string = overrideInfo[i].value

      let node: RowNode = <RowNode>adaptable_Api.gridApi.getRowNodeForPrimaryKey(posID)
      let oCols: string[] = Object.keys(this.overrideColMap);

      oCols.forEach(c =>  node.setDataValue(c, val))
    }
  }

  overridenPositionIDs = {}

  /** 
 * We have a set of 3 columns for each override column:
 *  Eg: expectedPrice
 *    We receive, `<expectedPrice,localExpectedPrice,globalExpectedPrice>`. expectedPrice is the column that is visible and editable on grid.
 *  To get overrides, we compare `expectedPrice` with `localExpectedPrice`.
 * 
 * To clear overrides, we simply set `expectedPrice = globalExpectedPrice` on the UI. 
 * 
 * */

  updateGridOverrides(context: 'Clear' | 'Set' = 'Clear'){

    if(this.selectedModelID == null && context === 'Set')
      return

    let gridData: any[]  = [];
    let updates = []
    this.gridApi.forEachNodeAfterFilterAndSort((node) => {
      if(node.data)
      gridData.push(node.data)
    })

    let oCols: string[] = Object.keys(this.overrideColMap);

    for(let i: number = 0; i < gridData?.length; i++){

      oCols.forEach(c => gridData[i][c] = (context === 'Clear') ? gridData[i][this.overrideColMap[c].global] : gridData[i][this.overrideColMap[c].local])

      gridData[i].isOverride = (context === 'Clear') ? 'No' : this.getIsOverride(gridData[i]); 
      updates.push(gridData[i])
    }

    this.gridApi.applyTransaction({ update: updates})
    // this.gridApi.refreshCells({
    //   force: true,
    //   suppressFlash: true,
    //   columns: [ ...Object.keys(this.overrideColMap), 'isOverride'] 
    // })
    adaptable_Api.gridApi.refreshCells(adaptable_Api.gridApi.getAllRowNodes(), ['clear_override',...Object.keys(this.overrideColMap), 'isOverride']);
  }

  fetchOverridesForModel(modelID: number){
    this.subscriptions.push(this.irrCalcService.getLocalOverrides(modelID).subscribe({
      next: overrideInfo => {
        this.localOverrides = overrideInfo
        this.updateGridWithOverrides(overrideInfo)        
      },
      error: error => {
        console.error(`Failed to fetch local overrides: ${error}`)
      }
    }))
  }

  /** On portfolio model select, clearing out all exisiting selected positions & applied filters 
 * and apply the ones from the model.
 *  A model is associated to either rules/positionIDs
 *  A model is associated to either having local overrides 
 * 
 * Based on the selected model, fetch its overrides values and apply them onto the grid.
*/

  onPortfolioModelSelect(event){
    this.selectedModelID = event.modelID

    adaptable_Api.filterApi.clearColumnFilters();
    this.gridApi.deselectAll();
    this.selectedPositionIDs = []

    /** On model selection, data will be refetched with overrides, hence we do not want to programmatically set it again, hence emitEvent: false */
    this.isLocal.setValue(this.modelMap[this.selectedModelID].isLocal, {emitEvent: false})

    //emitEvent: true (Default) since we want to switch layouts programmatically. 
    this.isAutomatic.setValue(!this.modelMap[this.selectedModelID].isManual)

    if(this.modelMap[this.selectedModelID].rules){
      adaptable_Api.filterApi.setColumnFilter(this.modelMap[this.selectedModelID].rules)
    }

    this.fetchIRRPostions()
 }

  changeListeners(){
    this.subscriptions.push(this.isAutomatic.valueChanges.subscribe( isAuto => {
      if(isAuto){
        adaptable_Api.layoutApi.setLayout('Automatic')
      }
      else {
        adaptable_Api.layoutApi.setLayout('Manual')
      }
    }))

    this.subscriptions.push(this.isLocal.valueChanges.subscribe(isLocal => {
      
      // Stop editing (i.e. get out of focus on just edited cells, if any)
      this.gridApi.stopEditing();

      this.gridApi.refreshCells({
        force: true,
        suppressFlash: true,
        columns: [ ...Object.keys(this.overrideColMap), 'isOverride'] 
      })
  
      if(!isLocal){
       this.updateGridOverrides('Clear');
       this.gridApi.stopEditing();
      }
      else{
        this.updateGridOverrides('Set')
      }

    }))
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    adaptable_Api = adaptableApi;
    adaptable_Api.toolPanelApi.closeAdapTableToolPanel();
    adaptable_Api.filterApi.clearColumnFilters();

    this.subscriptions.push(this.irrCalcService.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.pipe(first()).subscribe(isHit => {
      if(isHit){
        this.onReset()
        this.fetchIRRPostions();
      }
    }))  

    this.changeListeners()
  }

  onGridReady(params: GridReadyEvent){
    this.gridApi = params.api;
  }
  
  parseFetchedModels(data){
    /* Converts delimeted portfolio rules filter for the grid into Filter object*/
    this.modelData = data
    for(let i:number = 0; i < data.length; i+= 1){
      let tempRules: string = String(data[i].rules);
      this.modelData[i].displayName = Boolean(data[i].isShared) ? `${data[i].modelName}*` : `${data[i].modelName}`
      this.modelData[i].modelName = data[i].modelName;
      this.modelData[i].modelID = Number(data[i].modelID);
      this.modelData[i].modelDesc = data[i].modelDesc;
      this.modelData[i].isLocal = Boolean(data[i].isLocal);
      this.modelData[i].isShared = Boolean(data[i].isShared);
      this.modelData[i].isManual = Boolean(data[i].isManual);
      this.modelData[i].username = null;
      this.modelData[i].positionIDs = data[i].positionIDs?.split(',').map(x => parseInt(x))
      this.modelData[i].rules = [];
      this.modelData[i].aggregationType = data[i].irrAggrType;
      
      let ruleArr: string[] = tempRules.split('|').join('"').split('~');
      ruleArr.forEach(x => data[i].rules.push(JSON.parse(x)))

      if(ruleArr[0] === "null"){
        this.modelData[i].rules = null
      }
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
  }
}