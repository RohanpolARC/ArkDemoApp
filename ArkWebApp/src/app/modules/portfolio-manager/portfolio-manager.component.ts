import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { CellValueChangedEvent, ClientSideRowModelModule, ColDef, EditableCallbackParams, GridOptions, GridReadyEvent, Module, RowNode } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { PortfolioManagerService } from 'src/app/core/services/PortfolioManager/portfolio-manager.service';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { UpdateCellRendererComponent } from './update-cell-renderer/update-cell-renderer.component';

@Component({
  selector: 'app-portfolio-manager',
  templateUrl: './portfolio-manager.component.html',
  styleUrls: ['./portfolio-manager.component.scss']
})
export class PortfolioManagerComponent implements OnInit {

  accessObj: {
    editAccess: boolean,
    cloneAccess: boolean,
    approvalAccess: boolean
  }

  wsoPortfolioRef: any[]
  rowData
  columnDefs: ColDef[]
  defaultColDef
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions
  subscriptions: Subscription[] = []
  agGridModules: Module[] = [
    ClientSideRowModelModule,
    RowGroupingModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    ClipboardModule,
    SideBarModule,
    RangeSelectionModule
  ];
  actionClickedRowID: number = null;
  context: any;
  adapTableApi: AdaptableApi;

  constructor(
    private portfolioManagerSvc: PortfolioManagerService,
    private dataSvc: DataService,
    private accessSvc: AccessService
  ) { }

  ngOnInit(): void {

    this.accessObj = {
      editAccess: false,
      cloneAccess: false,
      approvalAccess: false
    }

    let userRoles: string[] = this.dataSvc.getCurrentUserInfo().idToken['roles'];

    if(userRoles.map(role => role.toLowerCase()).includes('admin.write')){
      this.accessObj.approvalAccess = true
    }

    for(let i: number = 0; i < this.accessSvc.accessibleTabs.length; i+= 1){
      if(this.accessSvc.accessibleTabs[i].tab === 'Portfolio Mapping' && this.accessSvc.accessibleTabs[i].isWrite){
        this.accessObj.editAccess = this.accessObj.cloneAccess = true;
        break;
      }        
    }

    this.subscriptions.push(this.dataSvc.getWSOPortfolioRef().subscribe({
      next: resp => {
        this.wsoPortfolioRef = resp
      },
      error: error => {
        this.wsoPortfolioRef = [];
        console.error(`Failed to load WSO Portfolio Ref Data: ${error}`)
      }
    }))

    this.columnDefs = [
      { field: 'mappingID' },
      { field: 'fund',
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fund'),
        cellStyle: this.getEditableCellStyle.bind(this)
      },
      { field: "fundLegalEntity",
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundLegalEntity'),
        cellStyle: this.getEditableCellStyle.bind(this)
      },
      { field: "fundHedging",
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundHedging'),
        cellStyle: this.getEditableCellStyle.bind(this)
      },
      { field: "fundStrategy",
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundStrategy'),
        cellStyle: this.getEditableCellStyle.bind(this),
      },
      { field: "fundPipeline2",
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundPipeline2'),
        cellStyle: this.getEditableCellStyle.bind(this),
      },
      { field: "fundSMA",
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundSMA'),
        cellStyle: this.getEditableCellStyle.bind(this),
      },
      { field: "fundInvestor",
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundInvestor'),
        cellStyle: this.getEditableCellStyle.bind(this)
      },
      { field: "wsoPortfolioID",
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getPortfolioIDParams.bind(this),
        cellStyle: this.getEditableCellStyle.bind(this)
      },
      { 
        field: "portfolioName",
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getPortfolioNameParams.bind(this),
        cellStyle: this.getEditableCellStyle.bind(this)
      },
      { field: "solvencyPortfolioName", 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'solvencyPortfolioName'),
        cellStyle: this.getEditableCellStyle.bind(this)
      },

      { field: "fundPipeline", 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundPipeline'),
        cellStyle: this.getEditableCellStyle.bind(this) 
      },
      { field: "fundCcy", 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundCcy'),
        cellStyle: this.getEditableCellStyle.bind(this)  
      },
      { field: "fundAdmin", 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundAdmin'),
        cellStyle: this.getEditableCellStyle.bind(this)  
      },
      { field: "portfolioAUMMethod", 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'portfolioAUMMethod'),
        cellStyle: this.getEditableCellStyle.bind(this),
      },
      { field: "fundRecon", 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundRecon'),
        cellStyle: this.getEditableCellStyle.bind(this)  
      },
      { field: "legalEntityName", 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'legalEntityName'),
        cellStyle: this.getEditableCellStyle.bind(this)  
      },
      { field: "lei", headerName: 'LEI', 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'lei'),
        cellStyle: this.getEditableCellStyle.bind(this)  
      },
      { field: "isCoinvestment", 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'isCoinvestment'),
        cellStyle: this.getEditableCellStyle.bind(this)  
      },
      { field: "excludeFxExposure", 
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'excludeFxExposure'),
        cellStyle: this.getEditableCellStyle.bind(this)  
      },
      { field: 'action', 
        cellRenderer: 'updateCellRenderer' 
      }
    ]

    this.defaultColDef = {
      resizable: true,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: false,
      // sortable: true,
      filter: true,
      autosize:true,
      floatingFilter: false
    }
  
    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      sideBar: true,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      frameworkComponents: {
        updateCellRenderer: UpdateCellRendererComponent,
        autocompleteCellEditor: MatAutocompleteEditorComponent
      },
      singleClickEdit: true,
      rowGroupPanelShow: 'always',
      onCellValueChanged: this.onCellValueChanged.bind(this)
    }

    this.adaptableOptions = {
      primaryKey: 'mappingID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Portfolio Manager ID',
      adaptableStateKey: 'Portfolio Manager Key',

      toolPanelOptions: {
        toolPanelOrder: ['columns', 'AdaptableToolPanel']
      },

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
  
      },

      predefinedConfig: {
        Dashboard: {
          Revision: 4,
          ModuleButtons: ['TeamSharing', 'Export', 'Layout', 'ConditionalStyle', 'Filter'],
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 11,
          CurrentLayout: 'Default Layout',
          Layouts: [{
            Name: 'Default Layout',
            Columns: [
              'fund',
              "fundLegalEntity",
              "fundHedging",
              "fundStrategy",
              "fundPipeline2",
              "fundSMA",
              "fundInvestor",
              "wsoPortfolioID",
              "portfolioName",
              "solvencyPortfolioName",
              "fundPipeline",
              "fundCcy",
              "fundAdmin",
              "portfolioAUMMethod",
              "fundRecon",
              "legalEntityName",
              "lei",
              "isCoinvestment",
              "excludeFxExposure",
              'action'
      
            ],
            PinnedColumnsMap: {
              action: 'right'
            }

          }]
        }
      }
    }
  }

  setSelectedRowID(rowID: number){
    this.actionClickedRowID = rowID;
    if(this.actionClickedRowID === null){
      /** 
       *    gridOptions.api (gridApi can be null on initial load, hence adding ? to not call    stopEditing())
       * 
       *  If not adding ?, can give error and wouldn't call getLiquiditySummaryPivoted() in filterBtnApplyState listener
       */
      this.gridOptions.api?.stopEditing(true);
    }
    this.gridOptions.api?.refreshCells({
      force: true,
      suppressFlash: true
    })
  }

  getSelectedRowID(){
    return this.actionClickedRowID;
  }

  getPortfolioIDParams(){
    return {
      options: this.wsoPortfolioRef.map(e => e['wsoPortfolioID'])
    }
  }

  getPortfolioNameParams(){
    return {
      options: this.wsoPortfolioRef.map(e => e['portfolioName'])
    }
  }

  getUniqueParamsFromGrid(field: string){
    return {
      options: [...new Set(this.getGridData().map(e => 
        {
          if(typeof e[field] === 'string')
            return String(e[field]).replace(/\s/g,'')
          else return e[field]
        }
        ))].filter(e => 
        String(e)?.replace(/\s/g,'').length && (e !== null) && (e !== undefined) && (e !== 0)
      ).sort()
    }
  }

  isEditable (params: EditableCallbackParams)  {
    return params.node.rowIndex === this.actionClickedRowID;
  }

  getEditableCellStyle (params) {
    return (params.rowIndex === this.actionClickedRowID) ? 
    {
      'border-color': '#0590ca',
    } : null
  }

  getGridData(){
    let liveData: any[] = []
    this.gridOptions?.api.forEachLeafNode(node => {
      liveData.push(node.data)
    })
    return liveData;
  }

  validateAndUpdate(params: CellValueChangedEvent){
    let nodeData = params.data;
    let val = params.newValue;
    let found: boolean = false

    if(params.column.getColId() === 'portfolioName'){

      let liveGrid = this.getGridData();
      let isDuplicate: boolean = false;

      for(let i: number = 0; i < liveGrid.length; i+= 1){
        if((liveGrid[i].mappingID !== params.data.mappingID) && (liveGrid[i]['portfolioName']?.toLowerCase() === params.newValue?.toLowerCase())){
          
          this.dataSvc.setWarningMsg('Duplicate Portfolios not allowed', 'Dismiss', 'ark-theme-snackbar-warning')
          isDuplicate = true
          nodeData['portfolioName'] = params.oldValue
          this.adapTableApi.gridApi.updateGridData([nodeData])
          break;
        }
      }

      if(!isDuplicate){
        for(let i: number = 0; i < this.wsoPortfolioRef.length; i+= 1){
          if(this.wsoPortfolioRef[i].portfolioName.toLowerCase() === val.toLowerCase()){
            nodeData['wsoPortfolioID'] = this.wsoPortfolioRef[i].wsoPortfolioID
            nodeData['portfolioName'] = this.wsoPortfolioRef[i].portfolioName
            
            found = true
            break;
          }
        }

        if(!found){
          nodeData['portfolioName'] = params.oldValue
          this.dataSvc.setWarningMsg('Please select Portfolio Name from the list', 'Dismiss', 'ark-theme-snackbar-warning')
        }
        this.adapTableApi.gridApi.updateGridData([nodeData]);
      }
    }
    else if(params.column.getColId() === 'wsoPortfolioID'){

      let liveGrid = this.getGridData();
      let isDuplicate: boolean = false;

      for(let i: number = 0; i < liveGrid.length; i+= 1){
        if((liveGrid[i].mappingID !== params.data.mappingID) && (Number(liveGrid[i]['wsoPortfolioID']) === Number(params.newValue))){
          
          this.dataSvc.setWarningMsg('Duplicate Portfolios not allowed', 'Dismiss', 'ark-theme-snackbar-warning')
          isDuplicate = true
          nodeData['wsoPortfolioID'] = Number(params.oldValue)
          this.adapTableApi.gridApi.updateGridData([nodeData])
          break;
        }
      }

      if(!isDuplicate){
        for(let i: number = 0; i < this.wsoPortfolioRef.length; i+= 1){
          if(Number(this.wsoPortfolioRef[i].wsoPortfolioID) === Number(val)){
            nodeData['wsoPortfolioID'] = Number(this.wsoPortfolioRef[i].wsoPortfolioID)
            nodeData['portfolioName'] = this.wsoPortfolioRef[i].portfolioName
            
            found = true
            break;
          }
        }

        if(!found){
          nodeData['wsoPortfolioID'] = Number(params.oldValue)
          this.dataSvc.setWarningMsg('Please select Portfolio ID from the list', 'Dismiss', 'ark-theme-snackbar-warning')
        }
        this.adapTableApi.gridApi.updateGridData([nodeData]);
      }
    }
  }

  onCellValueChanged(params: CellValueChangedEvent){
    this.validateAndUpdate(params)
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
  }

  onGridReady(params: GridReadyEvent){

    this.context = {
      componentParent: this
    }

    this.fetchPortfolioMapping();
  }

  fetchPortfolioMapping(){
    this.gridOptions?.api?.showLoadingOverlay();
    this.subscriptions.push(this.portfolioManagerSvc.getPortfolioMapping().subscribe({
      next: resp => {
        this.rowData = resp
        this.gridOptions.api?.hideOverlay();
      },
      error: error => {
        this.rowData = [];
        console.error(`Failed to load portfolio mapping data: ${error}`)
      }
    }))

  }

  refreshMappings(action: 'Refresh'){
    
    if(action === 'Refresh'){
      this.fetchPortfolioMapping();
    }
  }

  refreshApproval : { refresh: boolean }
  refreshApprovalGrid(){
    this.refreshApproval = { 
      refresh: true
    }
  }
  
}
