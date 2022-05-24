import { ColumnFilter, AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent, CheckboxColumnClickedInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { ClientSideRowModelModule, ColDef, EditableCallbackParams, GridOptions, RowSelectedEvent, RowNode, CellValueChangedEvent, GridReadyEvent, GridApi } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, Module,ExcelExportModule } from '@ag-grid-enterprise/all-modules';
import { ChangeDetectionStrategy, Component, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, removeDecimalFormatter, formatDate } from 'src/app/shared/functions/formatter';
import { IRRCalcParams, VPortfolioLocalOverrideModel } from 'src/app/shared/models/IRRCalculationsModel';
import { EventEmitter } from '@angular/core';
import { AggridMaterialDatepickerComponent } from '../../facility-detail/aggrid-material-datepicker/aggrid-material-datepicker.component';
import { PortfolioSaveRulesComponent } from '../portfolio-save-rules/portfolio-save-rules.component';

@Component({
  selector: 'app-portfolio-modeller',
  templateUrl: './portfolio-modeller.component.html',
  styleUrls: ['./portfolio-modeller.component.scss']
})
export class PortfolioModellerComponent implements OnInit {

  constructor(
    private dataService: DataService,
    private irrCalcService: IRRCalcService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  @Output() calcParamsEmitter = new EventEmitter<IRRCalcParams>();

  multiSelectPlaceHolder: string = null;
  dropdownSettings: IDropdownSettings = null;
  selectedDropdownData: any = null;

  asOfDate: string
  selectedModelID: number
  isAutomatic: FormControl
  isLocal: FormControl

  subscriptions: Subscription[] = [];
  rowData = []
  modelData: {
    modelID: number, modelName: string, displayName: string, modelDesc: string, 
    rules: ColumnFilter[], positionIDs: number[], 
    isLocal: boolean, isManual: boolean, username: string, isShared: boolean
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
    ExcelExportModule,
    FiltersToolPanelModule
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
    valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
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
  {
    field: 'positionPercent',
    width: 150,
    headerName: 'Position Percent',
    valueFormatter: removeDecimalFormatter, type:'abColDefNumber',
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
  gridApi: GridApi;
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

            // data[i].old_expectedDate = data[i].expectedDate
            // data[i].old_expectedPrice = data[i].expectedPrice
          }  

          // if(!this.selectedModelID){
          //   this.rowData = data;
          // }
          
          // for(let i = 0; i < this.rowData?.length; i+= 1){
          //   this.rowData[i]['IsChecked'] = false;
          //   if(this.selectedModelID){
          //     if(this.modelMap[this.selectedModelID].positionIDs?.includes(this.rowData[i].positionID))
          //     this.rowData[i]['IsChecked'] = true
          //   }
          // }

          // if(!this.selectedModelID){
          //   this.rowData = data
          // }
          // this.adapTableApi.gridApi.loadGridData(data)
          // this.rowData = data
          this.gridApi.setRowData(data)
          if(this.selectedModelID){
            if(this.modelMap[this.selectedModelID].positionIDs){

              this.gridApi.deselectAll();
              this.modelMap[this.selectedModelID].positionIDs?.forEach(posID => {
                let node: RowNode = this.adapTableApi.gridApi.getRowNodeForPrimaryKey(posID)
                node.setSelected(true);
                // this.selectedPositionIDs = []
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
    console.log(this.dataService.getCurrentUserName())
    this.subscriptions.push(this.irrCalcService.getPortfolioModels(this.dataService.getCurrentUserName()).subscribe({
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
    console.log(this.dataService.getCurrentUserName())

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

    // this.subscriptions.push(this.dataService.currentSearchDate.subscribe(asOfDate => {
    //   this.asOfDate = asOfDate;
    // }));

    // this.subscriptions.push(this.dataService.filterApplyBtnState.subscribe(isHit => {
    //   if(isHit){
    //     this.onReset()
    //     this.fetchIRRPostions();
    //   }
    // }))
    
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

  onRowSelected(event: RowSelectedEvent){
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
      console.log(node)
      colID = params.column.getColId();
      colVal = params.data[colID]
  
      let updates = [];
      for(let i: number = 0; i < node.allLeafChildren.length; i++){
      //  node.childrenAfterFilter[i].setDataValue(colID, colVal);
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
    // this.gridApi.getRow .gridApi.getVendorGrid().rowData;

    for(let i = 0 ; i < gridData.length; i++){

      if(gridData[i].expectedPrice !== gridData[i].globalExpectedPrice){
          console.log(gridData[i].expectedPrice, gridData[i].globalExpectedPrice)
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: 'expectedPrice',
            value: gridData[i].expectedPrice
          })
  
      }
      if(gridData[i].expectedDate !== gridData[i].globalExpectedDate){
          console.log(gridData[i].expectedDate, gridData[i].globalExpectedDate)
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: 'expectedDate',
            value: gridData[i].expectedDate
          })  
      }
      if(gridData[i].spreadDiscount !== gridData[i].globalSpreadDiscount){
          console.log(gridData[i].spreadDiscount, gridData[i].globalSpreadDiscount)
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: 'SpreadDiscount',
            value: gridData[i].spreadDiscount,
          })  
      }
      if(gridData[i].positionPercent !== gridData[i].globalPositionPercent){
          console.log(gridData[i].positionPercent, gridData[i].globalPositionPercent)
          temp.push({
            positionID: gridData[i].positionID,
            assetID: gridData[i].assetID,
            key: 'PositionPercent',
            value: gridData[i].positionPercent
          })  
      }
    }
    // for(let i: number = 0; i< gridData?.length; i+= 1){
    //   if(gridData[i].expectedDate !== gridData[i].globalExpectedDate){
    //   }
    //   if(gridData[i].expectedPrice !== gridData[i].globalExpectedPrice){
    //     console.log(gridData[i])
    //   }
    //   if(gridData[i].spreadDiscount !== gridData[i].globalSpreadDiscount){
    //   }
    //   if(gridData[i].positionPercent !== gridData[i].gloalPositionPercent){
    //   }
    // }
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
    /**
     * 
     * 
     */
    if(this.selectedDropdownData.length === 0 || this.selectedDropdownData === null){
      this.selectedModelID = null
    }

    if(!this.isAutomatic.value){
      this.selectedPositionIDs = this.gridApi.getSelectedNodes()?.map(node => node.data.positionID)
    }
    const dialogRef = this.dialog.open(PortfolioSaveRulesComponent, {
      data: {
        adaptableApi: this.adapTableApi, 
        model: this.modelMap[this.selectedModelID], 
        asOfDate: this.asOfDate, 
        isAutomatic: this.isAutomatic.value, 
        isLocal: this.isLocal.value,
        isShared: this.modelMap[this.selectedModelID]?.isShared,
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
          // this.fetchIRRPostions()
        }
        // if(res.context === 'Save' && res.isSuccess){
        //   /** If rules were successfully updated/inserted, then refresh the rules */
        //   this.fetchPortfolioModels(dialogRef.componentInstance.modelID);
        //   // this.selectedDropdownData = [
        //   //   {
        //   //     modelID: dialogRef.componentInstance.modelID,
        //   //     displayName: this.modelMap[dialogRef.componentInstance.modelID].displayName
        //   //   }
        //   // ]
        //   // this.selectedDropdownData = [{modelName: dialogRef.componentInstance.modelForm.get('modelName').value, modelID: dialogRef.componentInstance.modelID}]
        //   this.selectedModelID = dialogRef.componentInstance.modelID
        // }
        // else if(res.context === 'SaveRun' && res.isSuccess){
        //   console.log('Calling calcIRR')
        //   this.fetchPortfolioModels(dialogRef.componentInstance.modelID);
        //   // this.selectedDropdownData = [{modelName: dialogRef.componentInstance.modelForm.get('modelName').value, modelID: dialogRef.componentInstance.modelID}]

        //   // this.selectedDropdownData = [
        //   //   {
        //   //     modelID: dialogRef.componentInstance.modelID,
        //   //     displayName: this.modelMap[dialogRef.componentInstance.modelID].displayName
        //   //   }
        //   // ]

        //   this.selectedModelID = dialogRef.componentInstance.modelID
        //   this.calcIRR();
        // }
      }
    }))
  }

  calcIRR(){
    /** 
     * 
     * Opening new tab for IRR Result in IRR Calculation and sending IRRCalcParams as @Input to <app-irr-result> component.
     *  Portfolio Modeller -> IRR Calculation -> IRR Result 
    */

    let calcParams: IRRCalcParams = <IRRCalcParams>{};
    calcParams.asOfDate = this.asOfDate;
    calcParams.positionIDs = this.selectedPositionIDs;
    calcParams.modelID = this.isLocal.value ? this.selectedModelID : null,
    calcParams.modelName = this.modelMap[this.selectedModelID]?.modelName;

    this.calcParamsEmitter.emit(calcParams);
  }

  runIRRCalc(){
    this.onSavePortfolio('Save&Run');

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
        // node.setDataValue('old_expectedDate', val)
      }
      if(colName === 'expectedPrice'){
        node.setDataValue('expectedPrice', Number(val))
        // node.setDataValue('old_expectedPrice', Number(val))
      }
    }
  }

  overridenPositionIDs = {}

    /** 
   * We have a set of 3 columns for each override column:
   *  Eg: expectedPrice
   *    We receive, <expectedPrice,localExpectedPrice,globalExpectedPrice>. expectedPrice is the column that is visible and editable on grid.
   *  To get overrides, we compare `expectedPrice` with `localExpectedPrice`.
   * 
   * To clear overrides, we simply set expectedPrice = globalExpectedPrice on the UI. 
   * 
   * */

  updateGridOverrides(context: 'Clear' | 'Set' = 'Clear'){

    // let gridData: any[] = this.adapTableApi.gridApi.getVendorGrid().rowData;
    if(this.selectedModelID == null)
      return

    let gridData: any[]  = [];
    let updates = []
    this.gridApi.forEachLeafNode((node) => gridData.push(node.data))

    for(let i: number = 0; i < gridData?.length; i++){
      gridData[i].expectedPrice = (context === 'Clear') ? gridData[i].globalExpectedPrice : gridData[i].localExpectedPrice 
      gridData[i].expectedDate = (context === 'Clear') ? gridData[i].globalExpectedDate : gridData[i].localExpectedDate
      gridData[i].spreadDiscount = (context === 'Clear') ? gridData[i].globalSpreadDiscount : gridData[i].localSpreadDiscount
      gridData[i].positionPercent = (context === 'Clear') ? gridData[i].globalPositionPercent : gridData[i].localPositionPercent
      updates.push(gridData[i])
    }
    
    this.gridApi.applyTransaction({ update: updates})
    // this.rowData = gridData
    // this.gridApi.setRowData(gridData)
    this.gridApi.refreshCells({
      force: true,
      suppressFlash: true
    })
    // this.adapTableApi.gridApi.loadGridData(gridData);  
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
    console.log(event)
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
//    this.clearGridOverrides();

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
      console.log("Calling isAuto: " + isAuto)
      if(isAuto){
        this.adapTableApi.layoutApi.setLayout('Automatic')
      }
      else {
        this.adapTableApi.layoutApi.setLayout('Manual')
      }
    }))

    this.subscriptions.push(this.isLocal.valueChanges.subscribe(isLocal => {
      console.log("Calling Local: " + isLocal)

      this.gridApi.refreshCells({
        force: true,
        suppressFlash: true
      })
  
      if(!isLocal){
       this.updateGridOverrides('Clear');
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
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });

    this.adapTableApi.filterApi.clearAllColumnFilter();
  }

  onGridReady(params: GridReadyEvent){
    this.gridApi = params.api;

    this.subscriptions.push(this.dataService.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataService.filterApplyBtnState.subscribe(isHit => {
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
      
      let ruleArr: string[] = tempRules.split('|').join('"').split('~');
      ruleArr.forEach(x => data[i].rules.push(JSON.parse(x)))

      if(ruleArr[0] === "null"){
        this.modelData[i].rules = null
      }
    }
  }

}
