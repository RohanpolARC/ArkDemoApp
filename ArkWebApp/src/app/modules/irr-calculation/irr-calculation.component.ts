import { ActionColumnButtonContext, AdaptableApi, AdaptableButton, AdaptableOptions, AdaptableToolPanelAgGridComponent, CheckboxColumnClickedInfo, ColumnFilter } from '@adaptabletools/adaptable-angular-aggrid';
import { CellValueChangedEvent, ClientSideRowModelModule, ColDef, ColumnsToolPanelModule, EditableCallbackParams, ExcelExportModule, GridOptions, MenuModule, Module, RowGroupingModule, RowNode, RowSelectedEvent, SetFilterModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, removeDecimalFormatter, dateTimeFormatter, dateFormatter, formatDate } from 'src/app/shared/functions/formatter';
import { VPortfolioLocalOverrideModel } from 'src/app/shared/models/IRRCalculationsModel';
import { AggridMaterialDatepickerComponent } from '../facility-detail/aggrid-material-datepicker/aggrid-material-datepicker.component';
import { PortfolioSaveRulesComponent } from './portfolio-save-rules/portfolio-save-rules.component';

@Component({
  selector: 'app-irr-calculation',
  templateUrl: './irr-calculation.component.html',
  styleUrls: ['./irr-calculation.component.scss']
})
export class IrrCalculationComponent implements OnInit {

  constructor(
    private dataService: DataService,
    private irrCalcService: IRRCalcService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  tabs = ['Portfolio Modeller', 'Second', 'Third'];
  selected = new FormControl(0);

  multiSelectPlaceHolder: string = null;
  dropdownSettings: IDropdownSettings = null;
  dropdownData: any = null;
  selectedDropdownData: any = null;

  asOfDate: string
  selectedModelID: number
  isAutomatic: FormControl
  isLocal: FormControl

  subscriptions: Subscription[] = [];
  rowData = null
  modelData: {
    modelID: number, modelName: string, modelDesc: string, 
    rules: ColumnFilter[], positionIDs: number[], 
    isLocal: boolean, isManual: boolean, username: string
  }[]
  modelMap = {} //<id, model Object>
  selectedPositionIDs: number[] = []
  localOverrides

  agGridModules: Module[] = [
    ClientSideRowModelModule,
    RowGroupingModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule
  ];
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
    field: 'spread', 
    width: 94,
    cellClass: 'ag-right-aligned-cell', 
    valueFormatter: removeDecimalFormatter, type:'abColDefNumber'
  },
  {
    field: 'pikmargin', 
    width: 120,
    headerName: 'PIK Margin',
    cellClass: 'ag-right-aligned-cell',
    valueFormatter: removeDecimalFormatter, type:'abColDefNumber'
  },
  {field: 'unfundedMargin', 
   width: 160,
  valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', type:'abColDefNumber'},
  {field: 'floorRate', 
  width: 113,
  valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell', type:'abColDefNumber'},
  { field: 'expectedDate', 
    maxWidth: 150,
    width: 150,
    // valueFormatter: dateFormatter,
    type: 'abColDefDate',
    enableCellChangeFlash: true,
    cellEditor: 'agGridMaterialDatepicker',
    editable: (params: EditableCallbackParams) => {
      return this.isLocal.value
    },
    cellStyle: (params) => {
      return (this.isLocal.value && !params.node.group) ? 
      {
        'border-color': '#0590ca',
      } : {
        'border-color': '#fff'
      };
    }
  },
  { field: 'expectedPrice', 
    width: 140,
    valueFormatter: amountFormatter, 
    cellClass: 'ag-right-aligned-cell',
    type: 'abColDefNumber',
    enableCellChangeFlash: true,
    editable: (params: EditableCallbackParams) => {
      return this.isLocal.value
    },
    cellStyle: (params) => {
      return (this.isLocal.value && !params.node.group) ? 
      {
        'border-color': '#0590ca',
      } : {
        'border-color': '#fff'
      };
    }
  },
  { field: 'maturityPrice', 
    width: 136,
    valueFormatter: amountFormatter, 
    cellClass: 'ag-right-aligned-cell', type:'abColDefNumber'
  },
  {
    headerName: 'Spread Discount',
    width: 151,
    field: 'spreadDiscount',
    valueFormatter: removeDecimalFormatter, type:'abColDefNumber'
  },
  { field: 'assetClass', width: 145 },
  { field: 'capStructureTranche', width: 145 },
  { field: 'securedUnsecured', width: 145 },
  { field: 'seniority', width: 145 },
  { field: 'IsChecked', width: 50, headerName: 'Checked', type: 'abColDefBoolean',
  //  editable: true, 
    checkboxSelection: true,
  // cellRenderer: "checkboxRenderer"
  }
]
  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortable: true,
    filter: true,
    autosize:true,
  };
  autoGroupColumnDef: {
    pinned: 'left',
    cellRendererParams: {
      suppressCount: true     // Disable row count on group
    }
  }
  gridOptions: GridOptions;
  adapTableApi: AdaptableApi;
  adaptableOptions: AdaptableOptions;

  async getSharedEntities(adaptableId){
    return new Promise(resolve => {
      this.subscriptions.push(this.dataService.getAdaptableState(adaptableId).subscribe({
        next: state => {
          try {

            state = state.split('|').join('"')
            resolve(JSON.parse(state) ||'[]')
          } catch (e) {
            console.log("Failed to parse")
            resolve([])
          }
        }
      }));
    })
  }

  async setSharedEntities(adaptableId, sharedEntities): Promise<void>{

    return new Promise(resolve => {
      this.subscriptions.push(
        this.dataService.saveAdaptableState(adaptableId, JSON.stringify(sharedEntities).replace(/"/g,'|')).subscribe({
        next: data => {
          resolve();
        }
      }));
    })
  }

  fetchIRRPostions() {
    if(this.asOfDate !== null){
      this.subscriptions.push(this.irrCalcService.getIRRPositions(this.asOfDate).subscribe({
        next: data => {
          for(let i: number = 0; i < data?.length; i+= 1){
            data[i].expectedDate = formatDate(data[i]?.expectedDate)
            if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(data[i].expectedDate)){
              data[i].expectedDate = null;
            }  
            data[i].maturityDate = formatDate(data[i]?.maturityDate)
            if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(data[i].maturityDate)){
              data[i].maturityDate = null;
            }

            data[i].old_expectedDate = data[i].expectedDate
            data[i].old_expectedPrice = data[i].expectedPrice
          }  
          this.rowData = data;
          
          for(let i = 0; i < this.rowData?.length; i+= 1){
            this.rowData[i]['IsChecked'] = false;
          }
        },
        error: error => {
          console.error(`Failed to fetch positions data: ${error}`);
        }
      }))
  
    }
  }

  fetchPortfolioModels(){
    this.subscriptions.push(this.irrCalcService.getPortfolioModels().subscribe({
      next: data => {
        this.parseFetchedModels(data);
        this.InitModelMap()
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

    this.isAutomatic = new FormControl(false)
    this.isLocal = new FormControl(false)

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
      textField: 'modelName',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      searchPlaceholderText: 'Select Portfolio Model',
      closeDropDownOnSelection: true,

    }

    this.subscriptions.push(this.dataService.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataService.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.onReset()
        this.fetchIRRPostions();
      }
    }))
    
    this.gridOptions = {
      context: this.context,
      singleClickEdit: true,
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
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
      frameworkComponents: frameworkComponents,
      // groupMultiAutoColumn: true
      // frameworkComponents: {
      //   checkboxRenderer: CheckboxRenderer
      // }
    }

    this.adaptableOptions = {
      primaryKey: 'positionID',
      userName: this.dataService.getCurrentUserName(),
      adaptableId: 'IRR Calc - positions',
      adaptableStateKey: 'IRR Calc key',
      

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: this.setSharedEntities.bind(this),
        getSharedEntities: this.getSharedEntities.bind(this)
  
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
          Revision: 3,
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
              'assetClass',
              'capStructureTranche',
              'securedUnsecured',
              'seniority',
              'IsChecked'
            ],
            PinnedColumnsMap: {
              IsChecked: 'right'
            },
            RowGroupedColumns: ['fundHedging', 'issuerShortName']
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
              'assetClass',
              'capStructureTranche',
              'securedUnsecured',
              'seniority'
            ],
            RowGroupedColumns: ['fundHedging', 'issuerShortName'],
          }]
        },
        // FormatColumn: {
        //   Revision: 1,
        //   FormatColumns: [
        //     {
        //       Scope: {
        //         ColumnIds: ['IsChecked'],
        //       },
        //       ColumnStyle: {
        //         CheckBoxStyle: true,
        //       },
        //       IncludeGroupedRows: true
        //     },
        //   ],
        // },
      }

    }

    this.changeListeners()
  }

  onRowSelected(event: RowSelectedEvent){
    // if(event.data){
    //   if(this.selectedPositionIDs.includes(event.data.positionID)){
    //     this.selectedPositionIDs = this.selectedPositionIDs.filter(posID => posID !== event.data.positionID)
    //   }
    //   else{
    //     this.selectedPositionIDs.push(event.data.positionID)
    //   }
    // }

    // console.log(this.selectedPositionIDs)
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
    // let selectedPositionIDs: number[] = [];
    // if(params.data.IsChecked){
    //   selectedPositionIDs = this.setNodes(params.node, [])
    //   /** Tick all underlying nodes as adaptable isn't doing it by itself */

    //   if(params.node.group){
    //     for(let i = 0; i < this.rowData.length; i+= 1){
    //       if(selectedPositionIDs.includes(this.rowData[i].positionID)){
    //         this.rowData[i].IsChecked = true
    //       }
    //     }

    //     this.adapTableApi.gridApi.setGridData(this.rowData)
    //     console.log(selectedPositionIDs)
    //     console.log(this.rowData)
    //   }
    // }

    /** Updating all the filtered children nodes as Ag/Adaptable isn't doing itself */
    let node: RowNode = params.node, colID: string, colVal;
    if(node.group){

      colID = params.column.getColId();
      colVal = params.data[colID]
  
      for(let i: number = 0; i < node.childrenAfterFilter.length; i++){
        node.childrenAfterFilter[i].setDataValue(colID, colVal);
        // this.adapTableApi.bulkUpdateApi.applyBulkUpdate([{
        //   columnId: colID,
        //   rawValue: colVal,
        //   normalisedValue: colVal,
        //   displayValue: colVal,
        //   primaryKeyValue: node.data.positionID,
        //   rowNode: node.childrenAfterFilter[i]
        // }])
      }  
    }
  }

  getUpdatedValues(): VPortfolioLocalOverrideModel[]{
    let temp: VPortfolioLocalOverrideModel[] = [];
    for(let i: number = 0 ; i < this.rowData.length; i++){
      if(this.rowData[i].expectedDate !== this.rowData[i].old_expectedDate){
        temp.push({
          positionID: this.rowData[i].positionID,
          assetID: this.rowData[i].assetID,
          key: 'expectedDate',
          value: this.rowData[i].expectedDate
        })
      }
      if(this.rowData[i].expectedPrice !== this.rowData[i].old_expectedPrice){
        temp.push({
          positionID: this.rowData[i].positionID,
          assetID: this.rowData[i].assetID,
          key: 'expectedPrice',
          value: this.rowData[i].expectedPrice
        })
      }
    }
    return temp;
  }
  
  onSavePortfolio(context = 'Save'){
    /**
     * 
     * 
     */
    if(this.selectedDropdownData.length === 0 || this.selectedDropdownData === null){
      this.selectedModelID = null
    }

    if(!this.isAutomatic.value){
      this.selectedPositionIDs = this.gridOptions.api.getSelectedNodes()?.map(node => node.data.positionID)
    }
    const dialogRef = this.dialog.open(PortfolioSaveRulesComponent, {
      data: {
        adaptableApi: this.adapTableApi, 
        model: this.modelMap[this.selectedModelID], 
        asOfDate: this.asOfDate, 
        isAutomatic: this.isAutomatic.value, 
        isLocal: this.isLocal.value,
        positionIDs: this.selectedPositionIDs,
        updatedValues: this.getUpdatedValues(),
        context: context
      },
      maxHeight: '100vh',
      width: '60vw',
      maxWidth: '2000px'
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe(res => {
      if(dialogRef.componentInstance.isSuccess){
        if(this.isAutomatic.value){
          this.selectedPositionIDs = [];
          this.gridOptions.api.forEachNodeAfterFilter(node => 
            {
              if(!!node.data?.positionID)
                this.selectedPositionIDs.push(node.data?.positionID)
            })  
        }
        if(context === 'Save'){
          /** If rules were successfully updated/inserted, then refresh the rules */
          this.fetchPortfolioModels();
          this.selectedDropdownData = [{modelName: dialogRef.componentInstance.modelForm.get('modelName').value, modelID: dialogRef.componentInstance.modelID}]
          this.selectedModelID = dialogRef.componentInstance.modelID
        }
        else if(context === 'Save&Run'){
          console.log('Calling calcIRR')
          this.calcIRR();
        }
      }
    }))
  }

  calcIRR(){
    this.irrCalcService.updateCalcParams({
      asOfDate: this.asOfDate,
      positionIDs: this.selectedPositionIDs,
      /** modelID is sent to apply overrides only in Local mode, if modelID = null, then use global values  */
      modelID: this.isLocal.value ? this.selectedModelID : null,
      modelName: this.modelMap[this.selectedModelID].modelName
    })
    this.router.navigate(['/irr/runcalcs'])
  }

  runIRRCalc(){
    this.onSavePortfolio('Save&Run');

  }

  onReset(){
    /** Here, we clear all filters applied on the grid & change selectedRule to 'Default' in filterpane dropdown */

    if(this.adapTableApi){
      this.adapTableApi.filterApi.clearAllColumnFilter();
      this.gridOptions.api.deselectAll();
    }
    this.selectedDropdownData = [];
    this.selectedPositionIDs = [];  
    this.isAutomatic.setValue(false, {emitEvent: false})
    this.isLocal.setValue(false, {emitEvent: false})
    this.clearGridOverrides();
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
        // node.setDataValue('old_expectedDate', val)
      }
      if(colName === 'expectedPrice'){
        node.setDataValue('expectedPrice', Number(val))
        // node.setDataValue('old_expectedPrice', Number(val))
      }
    }
  }

  clearGridOverrides(){
    
    for(let i: number = 0; i < this.rowData?.length; i++){
      let posID: number = this.rowData[i].positionID;
      let node: RowNode = this.adapTableApi.gridApi.getRowNodeForPrimaryKey(posID);
      if(node.data.expectedDate !== this.rowData[i].old_expectedDate){
        node.setDataValue('expectedDate', this.rowData[i].old_expectedDate);        
      }
      if(node.data.expectedPrice !== this.rowData[i].old_expectedPrice){
        node.setDataValue('expectedPrice', this.rowData[i].old_expectedPrice);
      }
    }
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
  onPortfolioModelSelect(event){
    this.selectedModelID = event.modelID

    /** On portfolio model select, clearing out all exisiting selected positions & applied filters 
     * and apply the ones from the model.
     *  A model is associated to either rules/positionIDs
     *  A model is associated to either having local overrides 
     * 
     * 
     * Based on the selected model, fetch its overrides values and apply them onto the grid.
    */
    this.adapTableApi.filterApi.clearAllColumnFilter();
    this.selectedPositionIDs = []
    this.clearGridOverrides();

    if(this.modelMap[this.selectedModelID].rules){
      this.adapTableApi.filterApi.setColumnFilter(this.modelMap[this.selectedModelID].rules)
    }

    this.isLocal.setValue(this.modelMap[this.selectedModelID].isLocal)
    this.isAutomatic.setValue(!this.modelMap[this.selectedModelID].isManual)

    // this.gridOptions.api.forEachNodeAfterFilter(node => {
    //   console.log(node)
    //   if(!node.group){
    //     if(this.modelMap[this.selectedModelID].positionIDs.includes(node.data.positionID)){
    //       node.setSelected(true)
    //     }
    //     else node.setSelected(false)
    //   }
    // })  
    
    this.gridOptions.api.deselectAll();
    this.modelMap[this.selectedModelID].positionIDs?.forEach(posID => {
      let node: RowNode = this.adapTableApi.gridApi.getRowNodeForPrimaryKey(posID)
      node.setSelected(true);
      // this.selectedPositionIDs = []
    })
    this.selectedPositionIDs = this.modelMap[this.selectedModelID].positionIDs

    this.fetchOverridesForModel(this.selectedModelID);
 }

  changeListeners(){
    this.subscriptions.push(this.isAutomatic.valueChanges.subscribe( isAuto => {
      if(isAuto){
        this.adapTableApi.layoutApi.setLayout('Automatic')
        this.gridOptions.api.deselectAll();
      }
      else {
        this.adapTableApi.layoutApi.setLayout('Manual')
      }
    }))

    this.subscriptions.push(this.isLocal.valueChanges.subscribe(isLocal => {
      if(!isLocal){
        this.clearGridOverrides();
      }
      else{
        this.updateGridWithOverrides(this.localOverrides)
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
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });


    this.adapTableApi.eventApi.on(
      'CheckboxColumnClicked',
      (info: CheckboxColumnClickedInfo) => {
    })

    this.adapTableApi.filterApi.clearAllColumnFilter();
    // this.adapTableApi.filterApi.setColumnFilter([{ColumnId: "capStructureTranche", Predicate: {PredicateId: 'Values', Inputs: ['Unsecured Bond']}}])

  }

  parseFetchedModels(data){
    /* Converts delimeted portfolio rules filter for the grid into Filter object*/
    this.modelData = data
    for(let i:number = 0; i < data.length; i+= 1){
      let tempRules: string = String(data[i].rules);
      this.modelData[i].modelName = data[i].modelName;
      this.modelData[i].modelID = Number(data[i].modelID);
      this.modelData[i].modelDesc = data[i].modelDesc;
      this.modelData[i].username = null;
      this.modelData[i].positionIDs = data[i].positionIDs?.split(',').map(x => parseInt(x))
      this.modelData[i].rules = [];
      
      let ruleArr: string[] = tempRules.split('|').join('"').split('~');
      ruleArr.forEach(x => data[i].rules.push(JSON.parse(x)))

      if(ruleArr[0] === "null"){
        this.modelData[i].rules = null
      }
    }
  }

}
