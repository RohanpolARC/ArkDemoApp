import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { CellValueChangedEvent, ColDef, EditableCallbackParams, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { PortfolioManagerService } from 'src/app/core/services/PortfolioManager/portfolio-manager.service';
import { PortfolioMappingDataService } from 'src/app/core/services/PortfolioManager/portfolio-mapping-data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { BLANK_DATETIME_FORMATTER_CONFIG, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { UpdateCellRendererComponent } from './update-cell-renderer/update-cell-renderer.component';
import { getPortfolioIDParams, getPortfolioNameParams, getUniqueParamsFromGrid, isFieldValid, validateAndUpdate } from './utilities/functions';

@Component({
  selector: 'app-portfolio-manager',
  templateUrl: './portfolio-manager.component.html',
  styleUrls: ['./portfolio-manager.component.scss']
})
export class PortfolioManagerComponent implements OnInit {

  accessObj: {
    editAccess: boolean,
    cloneAccess: boolean,
    approvalAccess: boolean,
    editOnApproval: boolean // Editing on approval grid
  }

  rowData
  columnDefs: ColDef[]
  defaultColDef
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions
  subscriptions: Subscription[] = []
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  actionClickedRowID: number = null;
  context: any;
  adapTableApi: AdaptableApi;
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';
  maxMappingID: number  // Remembers the maximum mapping ID available currently in the system

  constructor(
    private portfolioManagerSvc: PortfolioManagerService,
    private dataSvc: DataService,
    private accessSvc: AccessService,
    private portfolioMapDataSvc: PortfolioMappingDataService,
    private msalSvc: MsalService

  ) { }

  setAccess(){

    this.accessObj = {
      editAccess: false,
      cloneAccess: false,
      approvalAccess: false,
      editOnApproval: false,
    }

    let userRoles: string[] = this.msalSvc.instance.getActiveAccount()?.idTokenClaims?.roles


      // Only Admin.Write has approv/reject access on approval grid
    if(userRoles.map(role => role.toLowerCase()).includes('admin.write')){
      this.accessObj.approvalAccess = true
    }

      // Only Operation.Write(UAT), Ops.Write(Prod), Admin.Write has access to editing on Approval grid
    this.accessObj.editOnApproval = userRoles.map(role => role.toLowerCase()).some((role) => ['operation.write', 'ops.write', 'admin.write'].includes(role))

    for(let i: number = 0; i < this.accessSvc.accessibleTabs.length; i+= 1){
      if(this.accessSvc.accessibleTabs[i].tab === 'Portfolio Mapping' && this.accessSvc.accessibleTabs[i].isWrite){
        this.accessObj.editAccess = this.accessObj.cloneAccess = true;
        break;
      }        
    }
  
  }

  ngOnInit(): void {

    this.setAccess();

    this.subscriptions.push(this.dataSvc.getWSOPortfolioRef().subscribe({
      next: resp => {
        this.portfolioMapDataSvc.setWSOPortfolioRef(resp);
      },
      error: error => {
        this.portfolioMapDataSvc.setWSOPortfolioRef([]);
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
        cellEditorParams: () => { return {
          ...this.getUniqueParamsFromGrid('portfolioAUMMethod'),
          isStrict: true
        }},
        cellStyle: this.getEditableCellStyle.bind(this)      
      },
      {
        field: 'valuationMethod',
        editable: this.isEditable.bind(this), cellEditor: 'autocompleteCellEditor', 
        cellEditorParams: () => { return { ...this.getUniqueParamsFromGrid('valuationMethod'), isStrict: true } }, cellStyle: this.getEditableCellStyle.bind(this)
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
      { field: "modifiedOn",  
        type:"abColDefDate"
      },
      { field: "modifiedBy", 
        type:"abColDefDate"
      },
      { field: "createdOn",  
        type:"abColDefDate"
      },
      { field: "createdBy", 
        type:"abColDefDate"
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
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      frameworkComponents: {
        updateCellRenderer: UpdateCellRendererComponent,
        autocompleteCellEditor: MatAutocompleteEditorComponent
      },
      singleClickEdit: true,
      rowGroupPanelShow: 'always',
      onCellValueChanged: this.onCellValueChanged.bind(this),
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'mappingID',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Portfolio Manager ID',
      adaptableStateKey: 'Portfolio Manager Key',

      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      // toolPanelOptions: {
      //   toolPanelOrder: ['columns', 'AdaptableToolPanel']
      // },

      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
  
      },

      predefinedConfig: {
        Dashboard: {
          Revision: 5,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 15,
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
              'valuationMethod',
              "fundRecon",
              "legalEntityName",
              "lei",
              "isCoinvestment",
              "excludeFxExposure",
              "modifiedOn",
              "modifiedBy",
              'action'
      
            ],
            PinnedColumnsMap: {
              action: 'right'
            },
            ColumnWidthMap:{
              action: 150
            }

          }]
        },
        FormatColumn:{
          Revision :3,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(['modifiedOn','createdOn']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['modifiedOn','createdOn'])
          ]
        }
      }
    }
  }

  setSelectedRowID(rowID: number){
    this.actionClickedRowID = rowID;
    if(this.actionClickedRowID === null){
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

  getPortfolioIDParams = getPortfolioIDParams.bind(this)
  getPortfolioNameParams = getPortfolioNameParams.bind(this)
  getUniqueParamsFromGrid = getUniqueParamsFromGrid.bind(this)
  
  isEditable (params: EditableCallbackParams)  {
    return params.node.rowIndex === this.actionClickedRowID;
  }

  getEditableCellStyle (params) {
    if(params.rowIndex === this.actionClickedRowID) {
      
      if(isFieldValid(params.column.getColId(), params.data))
        return { 'border-color': '#0590ca' }
      else return { 'border-color': 'red' }
    }
    return null;
  }

  getGridData(){
    let liveData: any[] = []
    this.gridOptions?.api.forEachLeafNode(node => {
      liveData.push(node.data)
    })
    return liveData;
  }

  validateAndUpdate = validateAndUpdate.bind(this, this.portfolioMapDataSvc, 'Mappings')

  onCellValueChanged(params: CellValueChangedEvent){
    this.validateAndUpdate(params)
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adapTableApi = adaptableApi;
    this.adapTableApi.toolPanelApi.closeAdapTableToolPanel();

    this.portfolioMapDataSvc.mappingsAdaptableApi = adaptableApi
  }

  onGridReady(params: GridReadyEvent){

    this.context = {
      componentParent: this
    }

    this.fetchPortfolioMapping();

    this.portfolioMapDataSvc.mappingsGridApi = params.api
  }

  fetchPortfolioMapping(){
    this.gridOptions?.api?.showLoadingOverlay();
    this.subscriptions.push(this.portfolioManagerSvc.getPortfolioMapping().subscribe({
      next: resp => {
        this.rowData = resp
        this.portfolioMapDataSvc.setMappings(resp);
        this.gridOptions?.api?.hideOverlay();

        this.maxMappingID = Math.max(...resp.map(r => r?.['mappingID']));
      },
      error: error => {
        this.rowData = [];
        this.portfolioMapDataSvc.setMappings([]);
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

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
  }
  
}
