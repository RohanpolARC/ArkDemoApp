import { ColumnFilter, AdaptableOptions, AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, EditableCallbackParams, GridOptions, RowNode, CellValueChangedEvent, GridReadyEvent, GridApi, Module } from '@ag-grid-community/core';
import { Component, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject, Subscription, timer } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, removeDecimalFormatter, formatDate } from 'src/app/shared/functions/formatter';
import { IRRCalcParams, MonthlyReturnsCalcParams, PerfFeesCalcParams, VPortfolioLocalOverrideModel } from 'src/app/shared/models/IRRCalculationsModel';
import { EventEmitter } from '@angular/core';
import { AggridMaterialDatepickerComponent } from '../../facility-detail/aggrid-material-datepicker/aggrid-material-datepicker.component';
import { PortfolioSaveRunModelComponent } from '../portfolio-save-run-model/portfolio-save-run-model.component';
import { getLastBusinessDay, getMomentDateStr, getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { CommonConfig } from 'src/app/configs/common-config';
import cryptoRandomString from 'crypto-random-string';
import { first, switchMap, takeUntil } from 'rxjs/operators';

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

  editableCellStyle = (params) => {
    return (this.isLocal.value && !params.node.group) ? 
    {
      'border-color': '#0590ca',
    } : {
      'border-color': '#fff'
    };
  }

  columnDefs: ColDef[] = [    
  {field: 'positionID', width:100, tooltipField: 'positionID', type:'abColDefNumber'},
  {field: 'fundHedging', width:150, tooltipField: 'fundHedging', rowGroup: true, pinned: 'left', type: 'abColDefString'}, 
  {field: 'issuerShortName', width: 170, tooltipField: 'issuerShortName', rowGroup: true, pinned: 'left', type: 'abColDefString'},
  {field: 'asset', width: 240, tooltipField: 'asset', type: 'abColDefString'},
  {field: 'assetID', width: 103, type:'abColDefNumber'},
  {field: 'assetTypeName', width: 153, type: 'abColDefString'},
  {field: 'fund', width: 150, tooltipField: 'fund', type: 'abColDefString'},
  {field: 'ccy', width: 80},
  {field: 'faceValueIssue',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', width: 150, type:'abColDefNumber'},
  {field: 'costPrice', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', width: 110, type:'abColDefNumber'},
  {field: 'mark', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', width: 86, type:'abColDefNumber'},
  {field: 'maturityDate', type: 'abColDefDate', width: 135, cellClass: 'dateUK'},
  {field: 'benchMarkIndex', width: 161, type: 'abColDefString'},
  { 
    field: 'spread', width: 94, cellClass: 'ag-right-aligned-cell', valueFormatter: removeDecimalFormatter, type:'abColDefNumber'
  },
  {
    field: 'pikmargin', width: 120, headerName: 'PIK Margin', cellClass: 'ag-right-aligned-cell', valueFormatter: removeDecimalFormatter, type:'abColDefNumber'
  },
  {
    field: 'unfundedMargin', width: 160, valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', type:'abColDefNumber'
  },
  {
    field: 'floorRate', width: 113, valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', type:'abColDefNumber'
  },
  { field: 'expectedDate', maxWidth: 150, width: 150, type: 'abColDefDate', enableCellChangeFlash: true,           cellEditor: 'agGridMaterialDatepicker',
    editable: (params: EditableCallbackParams) => {
      return this.isLocal.value
    },
    cellStyle: this.editableCellStyle.bind(this),
    cellClass: 'dateUK'
  },
  { field: 'expectedPrice', width: 140, valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', type: 'abColDefNumber', enableCellChangeFlash: true,
    editable: (params: EditableCallbackParams) => {
      return this.isLocal.value
    },
    cellStyle: this.editableCellStyle.bind(this)
  },
  { 
    field: 'maturityPrice', width: 136,valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', type:'abColDefNumber'
  },
  {
    headerName: 'Spread Discount', width: 151, field: 'spreadDiscount', enableCellChangeFlash: true, valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
    editable: (params: EditableCallbackParams) => {
      return this.isLocal.value
    },
    cellStyle: this.editableCellStyle.bind(this)
  },
  {
    field: 'positionPercent', width: 150, headerName: 'Position Percent', enableCellChangeFlash: true, valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
    editable: (params: EditableCallbackParams) => {
      return this.isLocal.value
    },
    cellStyle: this.editableCellStyle.bind(this)
  },
  { field: 'assetClass', width: 145 },
  { field: 'capStructureTranche', width: 145 },
  { field: 'securedUnsecured', width: 145 },
  { field: 'seniority', width: 145 },
  { field: 'IsChecked', width: 50, headerName: 'Checked', type: 'abColDefBoolean', checkboxSelection: true }
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

  setDateFields(row: any, fields: string[]){
    for(let i = 0; i < fields.length; i+= 1){
      row[fields[i]] = formatDate(row[fields[i]]);
      if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(row[fields[i]]))
        row[fields[i]] = null;
    }

    return row;
  }

  fetchIRRPostions() {
    if(this.asOfDate !== null){
      this.gridOptions?.api?.showLoadingOverlay();
      this.subscriptions.push(this.irrCalcService.getIRRPositions(this.asOfDate, this.selectedModelID).subscribe({
        next: data => {
          this.gridOptions?.api?.hideOverlay();
          for(let i: number = 0; i < data?.length; i+= 1){
            data[i] = this.setDateFields(data[i], ['expectedDate', 'localExpectedDate', 'globalExpectedDate', 'maturityDate'])
          }  

          adaptable_Api.gridApi.setGridData(data)
          if(this.selectedModelID){
            if(this.modelMap[this.selectedModelID].positionIDs){

              this.gridApi.deselectAll();
              this.modelMap[this.selectedModelID].positionIDs?.forEach(posID => {
                let node: RowNode = adaptable_Api.gridApi.getRowNodeForPrimaryKey(posID)
                node.setSelected(true);
                this.selectedPositionIDs = this.modelMap[this.selectedModelID].positionIDs
              })
            }
          
            this.selectManualPositions(this.selectedModelID);
          }

        },
        error: error => {
          this.rowData = []
          this.gridOptions?.api?.showNoRowsOverlay();
          console.error(`Failed to fetch positions data: ${error}`);
        }
      }))
  
    }
  }

  saveModelCashflowsAndOpenTabs(modelID?: number, context: string[] = ['SaveRunIRR'], runID: string = null, contextData: {  //changes context type from string to string[]
    baseMeasure?: string,
    feePreset?: string
  } = null){

    if(!modelID)
      console.error(`Model ID not received`)
      
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
            calcParamsData.push({ runID: runID, type: 'IRR'})
            break;
          default:
            break;
        }
    });

    this.multiCalculationStaging(this.modelMap[this.selectedModelID]?.modelName, calcParamsData)

    // Create params for generating cashflows and trigger the virtual model cashflow generator
    let m = <IRRCalcParams> {};
    m.runID = runID;
    m.asOfDate = this.asOfDate;
    m.modelID = modelID;
    m.positionIDs = this.selectedPositionIDs;

    // Load cashflows only if running IRR/Performance fees

    if(context.includes('SaveRunIRR') || context.includes('SaveRunPFees')){
      
      this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Loading' })

      this.irrCalcService.getPositionCashflows(m).pipe(first()).subscribe({
        next: resp => {

          timer(0, 10000).pipe(
            switchMap(() => this.irrCalcService.getIRRStatus(resp?.['statusQueryGetUri'])),
            takeUntil(this.closeTimer)
          ).subscribe({
            next: (res: any) => {

              if(res?.['runtimeStatus'] === 'Completed'){

                this.irrCalcService.loadedPositionCashflows = res['output'] ?? [];
                this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Loaded' })

                this.dataSvc.setWarningMsg(`Generated ${res['output']?.length} cashflows for the selected model`, `Dismiss`, `ark-theme-snackbar-normal`);
                this.closeTimer.next();
              }
              else if(res?.['runtimeStatus'] === 'Failed'){

                this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Failed' })               
                this.dataSvc.setWarningMsg(`Failed to generate the cashflows`, `Dismiss`, `ark-theme-snackbar-error`);
                this.closeTimer.next();
              }
            }
          })
        },
        error: error => {
          this.irrCalcService.cashflowLoadStatusEvent.emit({ runID: runID, status: 'Failed' });
          console.error(`Error in saving cashflows to DB: ${error}`);
          this.closeTimer.next();
        } 
      })

    }


  }

  fetchPortfolioModels(modelID?: number, context: string[] = ['SaveRunIRR'], runID: string = null, contextData: {  //changes context type from string to string[]
    baseMeasure?: string,
    feePreset?: string
  } = null){
    this.subscriptions.push(this.irrCalcService.getPortfolioModels(this.dataSvc.getCurrentUserName()).subscribe({
      next: data => {
        this.parseFetchedModels(data);
        this.InitModelMap()
        this.setSelectedModel(modelID)

        if(modelID)
        this.saveModelCashflowsAndOpenTabs(modelID, context, runID, contextData);

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

  ngOnInit(): void {

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
      agGridMaterialDatepicker: AggridMaterialDatepickerComponent
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
      frameworkComponents: frameworkComponents,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES
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
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
  
      },

      userInterfaceOptions: {
        dateInputOptions: {
          dateFormat: 'dd/MM/yyyy',
          locale: 'en-GB'
        }
      },

      layoutOptions: {
        autoSaveLayouts: false
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
          Revision: 6,
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
              'pikmargin',
              'unfundedMargin',
              'floorRate',
              'expectedDate',
              'expectedPrice',
              'maturityPrice',
              'spreadDiscount',
              'positionPercent',
              'assetClass',
              'capStructureTranche',
              'securedUnsecured',
              'seniority',
              'IsChecked'
            ],
            PinnedColumnsMap: {
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
              'pikmargin',
              'unfundedMargin',
              'floorRate',
              'expectedDate',
              'expectedPrice',
              'maturityPrice',
              'spreadDiscount',
              'positionPercent',
              'assetClass',
              'capStructureTranche',
              'securedUnsecured',
              'seniority'
            ],
            RowGroupedColumns: ['fund', 'issuerShortName'],
          }]
        },
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
    let node: RowNode = params.node, colID: string, colVal;
    if(node.group){
      colID = params.column.getColId();
      colVal = params.data[colID]
  
      let updates = [];
      for(let i: number = 0; i < node.allLeafChildren.length; i++){
       let nodeData = node.allLeafChildren[i].data;
       nodeData[colID] = colVal
       updates.push(nodeData)
      }
      this.gridApi.applyTransaction({ update: updates})

    }
  }

  getUpdatedValues(): VPortfolioLocalOverrideModel[]{
    let temp: VPortfolioLocalOverrideModel[] = [];

    let gridData = []
    this.gridApi.forEachLeafNode((node) => gridData.push(node.data))

    for(let i = 0 ; i < gridData.length; i++){

      if(gridData[i].expectedPrice !== gridData[i].globalExpectedPrice){
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: 'expectedPrice',
            value: gridData[i].expectedPrice
          })
  
      }
      if(gridData[i].expectedDate !== gridData[i].globalExpectedDate){
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: 'expectedDate',
            value: gridData[i].expectedDate
          })  
      }
      if(gridData[i].spreadDiscount !== gridData[i].globalSpreadDiscount){
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: 'SpreadDiscount',
            value: gridData[i].spreadDiscount,
          })  
      }
      if(gridData[i].positionPercent !== gridData[i].globalPositionPercent){
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: 'PositionPercent',
            value: gridData[i].positionPercent
          })  
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
        let node: RowNode = adaptable_Api?.gridApi?.getRowNodeForPrimaryKey(posID);
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
      gridData[i].localExpectedDate = gridData[i].expectedDate
      gridData[i].localExpectedPrice = gridData[i].expectedPrice
      gridData[i].localSpreadDiscount = gridData[i].spreadDiscount
      gridData[i].localPositionPercent = gridData[i].positionPercent
    }

    this.gridApi.applyTransaction({update: gridData})
    this.gridApi.refreshCells({
      force: true,
      suppressFlash: true
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

          // Generating runID to track all calc runs under this context. 
          let runID: string = cryptoRandomString({length: 20})
          
          this.fetchPortfolioModels(
            dialogRef.componentInstance.modelID,
            res.context,
            runID,
            {
              baseMeasure: res?.['baseMeasure'],
              feePreset: res?.['feePreset']
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
    feePreset?: string
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
    feePreset?: string
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

      let node: RowNode = adaptable_Api.gridApi.getRowNodeForPrimaryKey(posID)
      if(colName === 'expectedDate'){
        node.setDataValue('expectedDate', val)
      }
      if(colName === 'expectedPrice'){
        node.setDataValue('expectedPrice', Number(val))
      }
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

    for(let i: number = 0; i < gridData?.length; i++){
      gridData[i].expectedPrice = (context === 'Clear') ? gridData[i]?.globalExpectedPrice : gridData[i]?.localExpectedPrice 
      gridData[i].expectedDate = (context === 'Clear') ? gridData[i]?.globalExpectedDate : gridData[i]?.localExpectedDate
      gridData[i].spreadDiscount = (context === 'Clear') ? gridData[i]?.globalSpreadDiscount : gridData[i]?.localSpreadDiscount
      gridData[i].positionPercent = (context === 'Clear') ? gridData[i]?.globalPositionPercent : gridData[i]?.localPositionPercent
      updates.push(gridData[i])
    }
    this.gridApi.applyTransaction({ update: updates})
    this.gridApi.refreshCells({
      force: true,
      suppressFlash: true
    })
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
      this.gridApi.refreshCells({
        force: true,
        suppressFlash: true
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

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
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
}