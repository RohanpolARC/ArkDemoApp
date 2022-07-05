import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, Module, ClientSideRowModelModule, GridReadyEvent, RowNode } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule } from '@ag-grid-enterprise/all-modules';
import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { PortfolioManagerService } from 'src/app/core/services/PortfolioManager/portfolio-manager.service';
import { dateTimeFormatter } from 'src/app/shared/functions/formatter';
import { setSharedEntities, getSharedEntities } from 'src/app/shared/functions/utilities';
import { ApprovalActionCellRendererComponent } from '../approval-action-cell-renderer/approval-action-cell-renderer.component';

@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {

  @Input() access: {
    editAccess: boolean,
    cloneAccess: boolean,
    approvalAccess: boolean
  }

  @Output() refreshMappingsEvent = new EventEmitter<'Refresh'>();
  @Input() refreshApproval: { 
    refresh: boolean
  }

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
  adaptableApi: AdaptableApi;
  context: any;
  rowData: any;

  constructor(    
    private portfolioManagerSvc: PortfolioManagerService,
    private dataSvc: DataService
) { }

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


  getPendingCellStyle(col, params) {

    if(!params.node?.group && params.data?.['status'] === 'Pending'){

      let otherNode = this.getOtherNodeForID(params.data?.['stagingID'], params.data?.['state']);
      if(otherNode?.[col] !== params.data?.[col]){

        if(params.data?.['state'] === 'Current')
          return {
            'background-color': 'rgb(253,100,100)',
          }
        else if(params.data?.['state'] === 'Requested')
          return {
            'background-color': 'rgb(135, 243, 180)'
          }

      }

    }

    return null;
  }

  ngOnInit(): void {

    this.columnDefs = [
      { field: 'unqiueRowID' },
      { field: 'stagingID', type: 'abColDefNumber' },
      { field: 'mappingID' },
      { field: 'state'},
      { field: 'status'},
      { field: 'actionType'
      },
      { field: 'fund',
        cellStyle: this.getPendingCellStyle.bind(this, 'fund')
      },
      { field: "fundLegalEntity",
      cellStyle: this.getPendingCellStyle.bind(this, 'fundLegalEntity')
      },
      { field: "fundHedging",
      cellStyle: this.getPendingCellStyle.bind(this, 'fundHedging')

      },
      { field: "fundStrategy",
      cellStyle: this.getPendingCellStyle.bind(this, 'fundStrategy')

      },
      { field: "fundPipeline2",
      cellStyle: this.getPendingCellStyle.bind(this, 'fundPipeline2')

      },
      { field: "fundSMA",
      cellStyle: this.getPendingCellStyle.bind(this, 'fundSMA')

      },
      { field: "fundInvestor",
      cellStyle: this.getPendingCellStyle.bind(this, 'fundInvestor')

      },
      { field: "wsoPortfolioID",
      cellStyle: this.getPendingCellStyle.bind(this, 'wsoPortfolioID')

      },
      { 
        field: "portfolioName",
        cellStyle: this.getPendingCellStyle.bind(this, 'portfolioName')

      },
      { field: "solvencyPortfolioName", 
      cellStyle: this.getPendingCellStyle.bind(this, 'solvencyPortfolioName')

      },
      { field: "fundPipeline", 
      cellStyle: this.getPendingCellStyle.bind(this, 'fundPipeline')

      },
      { field: "fundCcy", 
      cellStyle: this.getPendingCellStyle.bind(this, 'fundCcy')

      },
      { field: "fundAdmin", 
      cellStyle: this.getPendingCellStyle.bind(this, 'fundAdmin')

      },
      { field: "portfolioAUMMethod", 
      cellStyle: this.getPendingCellStyle.bind(this, 'portfolioAUMMethod')

      },
      { field: "fundRecon", 
      cellStyle: this.getPendingCellStyle.bind(this, 'fundRecon')

      },
      { field: "legalEntityName", 
      cellStyle: this.getPendingCellStyle.bind(this, 'legalEntityName')

      },
      { field: "lei", headerName: 'LEI', 
      cellStyle: this.getPendingCellStyle.bind(this, 'lei')

      },
      { field: "isCoinvestment", 
      cellStyle: this.getPendingCellStyle.bind(this, 'isCoinvestment')

      },
      { field: "excludeFxExposure",
      cellStyle: this.getPendingCellStyle.bind(this, 'excludeFxExposure')

      },
      { field: "action", cellRenderer: 'actionCellRenderer'},
      { field: 'modifiedBy' },
      { field: 'modifiedOn', valueFormatter: dateTimeFormatter },
      { field: 'reviewedBy'},
      { field: 'reviewedOn', valueFormatter: dateTimeFormatter }
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
        actionCellRenderer: ApprovalActionCellRendererComponent
      },
      singleClickEdit: true,
      rowGroupPanelShow: 'always',
    }

    this.adaptableOptions = {
      primaryKey: 'uniqueRowID',

      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Portfolio Mapping Approval ID',
      adaptableStateKey: 'Portfolio Mapping Approval Key',

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
          Revision: 1,
          ModuleButtons: ['TeamSharing', 'Export', 'Layout', 'ConditionalStyle', 'Filter'],
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: ' '
        },

        Filter:{
          Revision: 3,
          ColumnFilters: [{
            ColumnId: 'status',
            Predicate: {
              PredicateId: 'Values',
              Inputs: ['Pending', 'Rejected']
            }
          }]
        },  

        Layout: {
          Revision: 13,
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
              "fundRecon",
              "legalEntityName",
              "lei",
              "isCoinvestment",
              "excludeFxExposure",
              'modifiedBy',
              'modifiedOn',
              'reviewedBy',
              'reviewedOn',
              'action'
      
            ],
            PinnedColumnsMap: {
              action: 'right'
            },
            ColumnWidthMap:{
              action: 150,
            },
            RowGroupedColumns: ['actionType', 'status', 'portfolioName']            

          }]
        }
      }
    }

  }

  ngOnDestroy(){
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel()
  }

  onGridReady(params: GridReadyEvent){

    this.context = {
      componentParent: this
    }

    // this.fetchPortfolioMappingStaging();
  }

  ngOnChanges(changes: SimpleChanges){

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
