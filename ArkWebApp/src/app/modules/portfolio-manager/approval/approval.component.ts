import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, Module, GridReadyEvent, RowNode, EditableCallbackParams, ICellRendererParams, CellValueChangedEvent, FirstDataRenderedEvent } from '@ag-grid-community/core';
import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { PortfolioManagerService } from 'src/app/core/services/PortfolioManager/portfolio-manager.service';
import { PortfolioMappingDataService } from 'src/app/core/services/PortfolioManager/portfolio-mapping-data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { BLANK_DATETIME_FORMATTER_CONFIG, dateTimeFormatter, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm } from 'src/app/shared/functions/formatter';
import { presistSharedEntities, loadSharedEntities, autosizeColumnExceptResized } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { ApprovalActionCellRendererComponent } from '../approval-action-cell-renderer/approval-action-cell-renderer.component';
import { getPortfolioIDParams, getPortfolioNameParams, getUniqueParamsFromGrid, validateAndUpdate, getPortfolioTypeParams } from '../utilities/functions';

@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {

  @Output() refreshMappingsEvent = new EventEmitter<'Refresh'>();

  @Input() access: {
    editAccess: boolean,
    cloneAccess: boolean,
    approvalAccess: boolean,
    editOnApproval: boolean
  }
  @Input() wsoPortfolioRef: any[]
  @Input() refreshApproval: { 
    refresh: boolean
  }

  columnDefs: ColDef[]
  defaultColDef
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions
  subscriptions: Subscription[] = []
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES;
  actionClickedRowID: number = null;
  adaptableApi: AdaptableApi;
  context: any;
  rowData: any;
  noRowsToDisplayMsg: NoRowsCustomMessages='No data found.';

  constructor(    
    private portfolioManagerSvc: PortfolioManagerService,
    private dataSvc: DataService,
    private portfolioMapDataSvc: PortfolioMappingDataService
) { }

  isEditable (params: EditableCallbackParams | ICellRendererParams)  {

    return (params.node.data?.['state'] === 'Requested') 
    && (['Pending', 'Rejected'].includes(params.node.data?.['status'])) 
    && ((this.access.approvalAccess) || this.access.editOnApproval)
    && (this.getSelectedRowID() === params.node.rowIndex)
  }

  getSelectedRowID(){
    return this.actionClickedRowID;
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

  getPortfolioIDParams = getPortfolioIDParams.bind(this)
  getPortfolioNameParams = getPortfolioNameParams.bind(this)
  getPortFolioTypeParams = getPortfolioTypeParams.bind(this)
  getUniqueParamsFromGrid = getUniqueParamsFromGrid.bind(this)

  /**
   * To find other node in case of state `UPDATE` and status `Pending`, to highlight it 
   * 
   * @param stagingID To find other node based on `stagingID`
   * @param rowState To find other node based on `rowState`
   * @returns `otherNode`
   */

  getOtherNodeForID(stagingID: number, rowState: 'Current' | 'Requested'): any{
    let otherNode
    this.gridOptions?.api?.forEachNodeAfterFilterAndSort((rowNode: RowNode, index: number) => {
      
      if(rowNode.data?.['stagingID'] === stagingID && rowNode.data?.['state'] !== rowState && rowNode.data?.['status'] === 'Pending'){
        otherNode = rowNode.data;
        return;
      }
    })

    return otherNode;
  }

  /**
   * 
   * @param col Grid column in context. Cells with `col` = `wsoPortfolioID`, `portfolioName` are not editable. Hence, no editable style is passed for them.
   * @param params Row params used to find if the row is editable and in valid state for coloring 
   * @returns Applicable cell style 
   */

  getCellStyle(col, params) {

    let onlyEdit = { borderColor: '#0590ca' }
    let current = { backgroundColor: 'rgb(253,100,100)' }
    let onlyRequested = { backgroundColor: 'rgb(135, 243, 180)'}
    let requestedAndEdit = { backgroundColor: 'rgb(135, 243, 180)',borderColor: '#0590ca'}

    if(!params.node?.group){

      if(params.data?.['actionType'] === 'ADD' && (params.node.rowIndex === this.getSelectedRowID())){
        return (!['wsoPortfolioID', 'portfolioName'].includes(col)) ? onlyEdit : null;
      }

      if(params.data?.['actionType'] === 'UPDATE'){

        if(params.data?.['status'] === 'Pending'){
          let otherNode = this.getOtherNodeForID(params.data?.['stagingID'], params.data?.['state']);
          if(otherNode?.[col] !== params.data?.[col]){
            if(params.data?.['state'] === 'Current'){
              return current;
            }
  
            if(params.data?.['state'] === 'Requested'){
              if(params.node.rowIndex === this.getSelectedRowID() && !['wsoPortfolioID', 'portfolioName'].includes(col)){
                return requestedAndEdit;
              }
              else return onlyRequested;
            }
          }
          else{
            if(params.node.rowIndex === this.getSelectedRowID()){
              return ['wsoPortfolioID', 'portfolioName'].includes(col) ? null : onlyEdit;
            }
          }  
        }
        else if(params.data?.['status'] === 'Rejected'){
          if(params.node.rowIndex === this.getSelectedRowID()){
            return ['wsoPortfolioID', 'portfolioName'].includes(col) ? null : onlyEdit;
          }
        }
      }

    }

    return null
  }

  /**
   * NOT IN USE as not allowing edit for `wsoPortfolioID`, `portfolioName` on approval grid.
   * 
   * To validate & update entered `wsoPortfolioID`, `portfolioName`.
   * @param params Cell params to validate updated cell
   */
  validateAndUpdate(params: CellValueChangedEvent){

    let wsoRef = this.portfolioMapDataSvc.getWSOPortfolioRef()

    if(params.column.getColId() === 'wsoPortfolioID' || params.column.getColId() === 'portfolioName'){
      
      for(let i: number = 0; i < wsoRef.length; i+= 1){

        let data = params.node.data
        if(params.column.getColId() === 'wsoPortfolioID' && Number(params.newValue) === Number(wsoRef[i]['wsoPortfolioID'])){

          data['wsoPortfolioID'] = Number(params.newValue)
          data['portfolioName'] = wsoRef[i]['portfolioName']
          this.adaptableApi.gridApi.updateGridData([data])
          break;
        }
        else if(params.column.getColId() === 'portfolioName' && params.newValue?.toLowerCase() === wsoRef[i]['portfolioName']?.toLowerCase()){

          data['wsoPortfolioID'] = Number(wsoRef[i]['wsoPortfolioID'])
          data['portfolioName'] = wsoRef[i]['portfolioName']
          this.adaptableApi.gridApi.updateGridData([data])
          break;

        }
      }
    }    
  }

  onCellValueChanged(params: CellValueChangedEvent){

    if(params.column.getColId() === 'wsoPortfolioID' || params.column.getColId() === 'portfolioName'){
      this.validateAndUpdate(params)    
    }

    // Refreshing cells after every value change on the grid

    this.gridOptions?.api?.refreshCells({
      force: true,
      suppressFlash: true
    })
  }
  
  ngOnInit(): void {

    this.columnDefs = [
      { field: 'unqiueRowID' },
      { field: 'stagingID', type: 'abColDefNumber' },
      { field: 'mappingID', type: 'abColDefNumber' },
      { field: 'state', type: 'abColDefString'},
      { field: 'status', type: 'abColDefString', filter: true},
      { field: 'actionType', type: 'abColDefString'},
      { field: 'fund', type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fund'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fund'),
      },
      { field: "fundLegalEntity", type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fundLegalEntity'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundLegalEntity'),
      },
      { field: "fundHedging", type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fundHedging'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundHedging'),
      },
      { field: "fundStrategy", type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fundStrategy'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundStrategy'),
      },
      { field: "fundPipeline2", type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fundPipeline2'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundPipeline2'),

      },
      { field: "fundSMA", type: 'abColDefBoolean',
        cellStyle: this.getCellStyle.bind(this, 'fundSMA'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundSMA'),

      },
      { field: "fundInvestor", type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fundInvestor'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundInvestor'),

      },
      { field: "wsoPortfolioID", type: 'abColDefNumber',
        cellStyle: this.getCellStyle.bind(this, 'wsoPortfolioID'),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'wsoPortfolioID'),

      },
      { field: "portfolioName", type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'portfolioName'),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'portfolioName'),

      },
      { field: "solvencyPortfolioName",  type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'solvencyPortfolioName'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'solvencyPortfolioName'),

      },
      { field: "fundPipeline",  type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fundPipeline'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundPipeline'),

      },
      { field: "fundCcy",  type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fundCcy'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundCcy'),

      },
      { field: "fundAdmin",  type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fundAdmin'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundAdmin'),

      },
      { field: "portfolioAUMMethod",  type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'portfolioAUMMethod'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams:() => { return {
          ...this.getUniqueParamsFromGrid('portfolioAUMMethod'),
          isStrict: true
        }}
      },
      { field: "valuationMethod",  type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'valuationMethod'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams:() => { return {
          ...this.getUniqueParamsFromGrid('valuationMethod'),
          isStrict: true
        }}
      },
      { field: "fundRecon",  type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'fundRecon'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'fundRecon'),

      },
      { field: "legalEntityName",  type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'legalEntityName'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'legalEntityName'),
      },
      { field: "lei", headerName: 'LEI',  type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'lei'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'lei'),
      },
      { field: "isCoinvestment",  type: 'abColDefBoolean',
        cellStyle: this.getCellStyle.bind(this, 'isCoinvestment'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'isCoinvestment'),
      },
      { field: "excludeFxExposure", type: 'abColDefBoolean',
        cellStyle: this.getCellStyle.bind(this, 'excludeFxExposure'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: this.getUniqueParamsFromGrid.bind(this, 'excludeFxExposure'),
      },
      { field: "portfolioType", type: 'abColDefString',
        cellStyle: this.getCellStyle.bind(this, 'portfolioType'),
        editable: this.isEditable.bind(this),
        cellEditor: 'autocompleteCellEditor',
        cellEditorParams: () => { return {
          ...this.getPortFolioTypeParams(),
          isStrict: true
        }},
      },
      { field: "action", cellRenderer: 'actionCellRenderer'},
      { field: 'modifiedBy', headerName: 'Requested By',  type: 'abColDefString' },
      { field: 'modifiedOn', headerName: 'Requested On', type: 'abColDefDate', cellClass: 'dateUK'},
      { field: 'reviewedBy', type: 'abColDefString'},
      { field: 'reviewedOn', type: 'abColDefDate', cellClass: 'dateUK' },
      { field: 'remark', type: 'abColDefString' }
    ]

    this.defaultColDef = {
      resizable: true,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: false,
      autosize:true,
      floatingFilter: false
    }

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      sideBar: true,
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      components: {
        actionCellRenderer: ApprovalActionCellRendererComponent,
        autocompleteCellEditor: MatAutocompleteEditorComponent
      },
      singleClickEdit: true,
      rowGroupPanelShow: 'always',
      onCellValueChanged: this.onCellValueChanged.bind(this),
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: 'uniqueRowID',

      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Portfolio Mapping Approval ID',
      adaptableStateKey: 'Portfolio Mapping Approval Key',

      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      layoutOptions: {
        displayRowGroups:'expanded'
      },

      // toolPanelOptions: {
      //   toolPanelOrder: ['columns', 'AdaptableToolPanel']
      // },

      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
  
      },

      predefinedConfig: {
        Dashboard: {
          Revision: 2,
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
          Revision: 21,
          CurrentLayout: 'Default Approval Layout',
          Layouts: [{
            Name: 'Default Approval Layout',
            Columns: [
              'state',
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
              "portfolioType",
              'modifiedBy',
              'modifiedOn',
              'remark',
              'reviewedBy',
              'reviewedOn',
              'action'
      
            ],
            ExpandedRowGroupValues: ['actionType', 'status'],
            PinnedColumnsMap: {
              action: 'right'
            },
            ColumnWidthMap:{
              action: 170,
            },
            RowGroupedColumns: ['actionType', 'status', 'portfolioName'],            
            ColumnFilters: [{
              ColumnId: 'status',
              Predicate: {
                PredicateId: 'Values',
                Inputs: ['Pending', 'Rejected']
              }
            }]  
          }]
        },
        FormatColumn:{
          Revision:2,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(['reviewedOn','modifiedOn']),
            DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['reviewedOn','modifiedOn'])
          ]
        },
        StatusBar: {
          Revision:1,
          StatusBars: [
            {
              Key: 'Right Panel',
              StatusBarPanels: ['StatusBar','CellSummary','Layout','Export'],
            },
          ],
        }
      }
    }

  }

  ngOnDestroy(){
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel()
    this.adaptableApi.columnApi.autosizeAllColumns()

    this.portfolioMapDataSvc.approvalAdaptableApi = adaptableApi
  }

  onGridReady(params: GridReadyEvent){

    this.context = {
      componentParent: this
    }

    this.portfolioMapDataSvc.approvalGridApi = params.api;

  }

  ngOnChanges(changes: SimpleChanges){

    
    //To refresh approval grid, when something changes on the mappings grid
    
    if(changes.refreshApproval){
      this.fetchPortfolioMappingStaging();
    }
  }

  fetchPortfolioMappingStaging(){

    this.gridOptions?.api.showLoadingOverlay();
    this.subscriptions.push(this.portfolioManagerSvc.getPortfolioMappingStaging().subscribe({
      next: stagingData => {
        for(let i: number = 0; i < stagingData.length; i+=1){
          stagingData[i].uniqueRowID = i+1;
        }

        this.rowData = stagingData;
        this.adaptableApi.gridApi.loadGridData(stagingData)
        this.gridOptions?.api.hideOverlay();
      },
      error: error => {
        this.rowData = [];
        console.error("Failed to load approve requests data"  + error);
      }
    }))
  }

}
