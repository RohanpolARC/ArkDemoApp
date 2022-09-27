import { ColumnFilter, AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent, CheckboxColumnClickedInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { ClientSideRowModelModule, ColDef, EditableCallbackParams, GridOptions, RowSelectedEvent, RowNode, CellValueChangedEvent, GridReadyEvent, GridApi } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, Module,ExcelExportModule, ClipboardModule, RangeSelectionModule, SideBarModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, removeDecimalFormatter, formatDate } from 'src/app/shared/functions/formatter';
import { IRRCalcParams, VPortfolioLocalOverrideModel } from 'src/app/shared/models/IRRCalculationsModel';
import { EventEmitter } from '@angular/core';
import { AggridMaterialDatepickerComponent } from '../../facility-detail/aggrid-material-datepicker/aggrid-material-datepicker.component';
import { PortfolioSaveRunModelComponent } from '../portfolio-save-run-model/portfolio-save-run-model.component';
import { getLastBusinessDay, getMomentDate, getMomentDateStr, getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-portfolio-modeller',
  templateUrl: './portfolio-modeller.component.html',
  styleUrls: ['./portfolio-modeller.component.scss']
})
export class PortfolioModellerComponent implements OnInit {

  constructor(
    private dataSvc: DataService,
    private irrCalcService: IRRCalcService,
    public dialog: MatDialog
  ) { }

  @Output() calcParamsEmitter = new EventEmitter<IRRCalcParams>();

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

  agGridModules: Module[] = [
    ClientSideRowModelModule, RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule
  ];

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
  {field: 'fundHedging', width:150, tooltipField: 'fundHedging', rowGroup: true, pinned: 'left'}, 
  {field: 'issuerShortName', width: 170, tooltipField: 'issuerShortName', rowGroup: true, pinned: 'left'},
  {field: 'asset', width: 240, tooltipField: 'asset'},
  {field: 'assetID', width: 103, type:'abColDefNumber'},
  {field: 'assetTypeName', width: 153},
  {field: 'fund', width: 150, tooltipField: 'fund'},
  {field: 'ccy', width: 80},
  {field: 'faceValueIssue',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', width: 150, type:'abColDefNumber'},
  {field: 'costPrice', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', width: 110, type:'abColDefNumber'},
  {field: 'mark', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', width: 86, type:'abColDefNumber'},
  {field: 'maturityDate',
   width: 135},
  {field: 'benchMarkIndex', width: 161},
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
    cellStyle: this.editableCellStyle.bind(this)
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

  fetchIRRPostions() {
    if(this.asOfDate !== null){
      this.gridOptions?.api?.showLoadingOverlay();
      this.subscriptions.push(this.irrCalcService.getIRRPositions(this.asOfDate, this.selectedModelID).subscribe({
        next: data => {
          this.gridOptions?.api?.hideOverlay();
          for(let i: number = 0; i < data?.length; i+= 1){
            data[i].expectedDate = formatDate(data[i]?.expectedDate)
            if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(data[i].expectedDate)){
              data[i].expectedDate = null;
            }
            data[i].localExpectedDate = formatDate(data[i]?.localExpectedDate)
            if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(data[i].localExpectedDate)){
              data[i].localExpectedDate = null;
            }
            data[i].globalExpectedDate = formatDate(data[i]?.globalExpectedDate)
            if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(data[i].globalExpectedDate)){
              data[i].globalExpectedDate = null;
            }  
            data[i].maturityDate = formatDate(data[i]?.maturityDate)
            if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(data[i].maturityDate)){
              data[i].maturityDate = null;
            }
          }  

          this.gridApi.setRowData(data)
          if(this.selectedModelID){
            if(this.modelMap[this.selectedModelID].positionIDs){

              this.gridApi.deselectAll();
              this.modelMap[this.selectedModelID].positionIDs?.forEach(posID => {
                let node: RowNode = this.adapTableApi.gridApi.getRowNodeForPrimaryKey(posID)
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

  fetchPortfolioModels(modelID?: number, context: string = 'SaveRun'){
    this.subscriptions.push(this.irrCalcService.getPortfolioModels(this.dataSvc.getCurrentUserName()).subscribe({
      next: data => {
        this.parseFetchedModels(data);
        this.InitModelMap()
        this.setSelectedModel(modelID)
        if(!!modelID && context === 'SaveRun'){
            this.calcIRR();
        }
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
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      rowGroupPanelShow: 'always',
      rowSelection: 'multiple',
      groupSelectsFiltered: true,
      groupSelectsChildren: true,
      suppressRowClickSelection: true,
      suppressAggFuncInHeader: true,
      enableGroupEdit: true,
      autoGroupColumnDef: this.autoGroupColumnDef,
      frameworkComponents: frameworkComponents
    }

    this.adaptableOptions = {
      primaryKey: 'positionID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'IRR Calc - positions',
      adaptableStateKey: 'IRR Calc key',
      

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

      predefinedConfig: {  
        Dashboard: {
          Revision: 2,
          ModuleButtons: ['TeamSharing', 'Export', 'Layout', 'ConditionalStyle'],
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],  
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 5,
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

    this.changeListeners()
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
    this.adapTableApi?.gridApi?.deselectAll();
    if(positionIDs != null || positionIDs != []){
      positionIDs.forEachLeafNode(posID => {
        let node: RowNode = this.adapTableApi?.gridApi?.getRowNodeForPrimaryKey(posID);
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

  onSavePortfolio(context = 'Save'){

    if(this.selectedDropdownData.length === 0 || this.selectedDropdownData === null){
      this.selectedModelID = null
    }

    if(!this.isAutomatic.value){
      this.selectedPositionIDs = this.gridApi.getSelectedNodes()?.map(node => node.data.positionID)
    }
    const dialogRef = this.dialog.open(PortfolioSaveRunModelComponent, {
      data: {
        adaptableApi: this.adapTableApi, 
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
      if(dialogRef.componentInstance.isSuccess){
        if(this.isAutomatic.value){
          this.selectedPositionIDs = [];
          this.gridApi.forEachNodeAfterFilter(node => 
            {
              if(!!node.data?.positionID)
                this.selectedPositionIDs.push(node.data?.positionID)
            })  
        }
        if(res.isSuccess){
          this.selectedModelID = dialogRef.componentInstance.modelID
          this.fetchPortfolioModels(dialogRef.componentInstance.modelID, res.context);
          this.updateLocalFields()
        }        
      }
    }))
  }

  /** 
   * Opening new tab for IRR Result in IRR Calculation and sending IRRCalcParams as `@Input` to `<app-irr-result>` component.
   *  Portfolio Modeller -> IRR Calculation -> IRR Result 
  */
  calcIRR(){

    let calcParams: IRRCalcParams = <IRRCalcParams>{};
    calcParams.asOfDate = this.asOfDate;
    calcParams.positionIDs = this.selectedPositionIDs;
    calcParams.modelID = this.isLocal.value ? this.selectedModelID : null,
    calcParams.modelName = this.modelMap[this.selectedModelID]?.modelName;
    calcParams.irrAggrType = this.modelMap[this.selectedModelID]?.irrAggrType;

    this.calcParamsEmitter.emit(calcParams);
  }

  runIRRCalc(){
    this.onSavePortfolio('SaveRun');

  }

  onReset(userAction: boolean = false){
    /** Here, we clear all filters applied on the grid, overrides, toggles etc.*/

    if(this.adapTableApi){
      this.adapTableApi.filterApi.clearAllColumnFilter();
      this.gridApi.deselectAll();
      if(userAction)
        this.updateGridOverrides('Clear');
    }
    this.selectedDropdownData = [];
    this.selectedPositionIDs = [];

    if(userAction)
      this.isLocal.setValue(false) 
    else
      this.isLocal.setValue(false, {emitEvent: false})

    this.isAutomatic.setValue(false)
    this.localOverrides = null
    this.selectedModelID = null
  }

  updateGridWithOverrides(overrideInfo: any){
    for(let i = 0; i < overrideInfo?.length; i+= 1){
      const posID: number = Number(overrideInfo[i].positionID),
            assetID: number = Number(overrideInfo[i].assetID),
            colName: string = overrideInfo[i].key,
            val: string = overrideInfo[i].value

      let node: RowNode = this.adapTableApi.gridApi.getRowNodeForPrimaryKey(posID)
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

    this.adapTableApi.filterApi.clearAllColumnFilter();
    this.selectedPositionIDs = []

    if(this.modelMap[this.selectedModelID].rules){
      this.adapTableApi.filterApi.setColumnFilter(this.modelMap[this.selectedModelID].rules)
    }

    /** On model selection, data will be refetched with overrides, hence we do not want to programmatically set it again, hence emitEvent: false */
    this.isLocal.setValue(this.modelMap[this.selectedModelID].isLocal, {emitEvent: false})

    //emitEvent: true (Default) since we want to switch layouts programmatically. 
    this.isAutomatic.setValue(!this.modelMap[this.selectedModelID].isManual)

    this.fetchIRRPostions()
 }

  changeListeners(){
    this.subscriptions.push(this.isAutomatic.valueChanges.subscribe( isAuto => {
      if(isAuto){
        this.adapTableApi.layoutApi.setLayout('Automatic')
      }
      else {
        this.adapTableApi.layoutApi.setLayout('Manual')
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

  onAdaptableReady(
    {
      adaptableApi,
      vendorGrid,
    }: {
      adaptableApi: AdaptableApi;
      vendorGrid: GridOptions;
    }
  ) {
    this.adapTableApi = adaptableApi;
    this.adapTableApi.toolPanelApi.closeAdapTableToolPanel()

    this.adapTableApi.filterApi.clearAllColumnFilter();
  }

  onGridReady(params: GridReadyEvent){
    this.gridApi = params.api;

    this.subscriptions.push(this.irrCalcService.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.onReset()
        this.fetchIRRPostions();
      }
    }))  
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