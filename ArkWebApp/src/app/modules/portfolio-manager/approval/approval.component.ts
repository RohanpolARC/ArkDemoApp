import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, Module, ClientSideRowModelModule, GridReadyEvent } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule } from '@ag-grid-enterprise/all-modules';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
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

  ngOnInit(): void {

    this.columnDefs = [
      { field: 'unqiueRowID' },
      { field: 'stagingID' },
      { field: 'mappingID' },
      { field: 'state'},
      { field: 'actionType'
      },
      { field: 'fund',
      },
      { field: "fundLegalEntity",
      },
      { field: "fundHedging",
      },
      { field: "fundStrategy",
      },
      { field: "fundPipeline2",
      },
      { field: "fundSMA",
      },
      { field: "fundInvestor",
      },
      { field: "wsoPortfolioID",
      },
      { 
        field: "portfolioName",
      },
      { field: "solvencyPortfolioName", 
      },
      { field: "fundPipeline", 
      },
      { field: "fundCcy", 
      },
      { field: "fundAdmin", 
      },
      { field: "portfolioAUMMethod", 
      },
      { field: "fundRecon", 
      },
      { field: "legalEntityName", 
      },
      { field: "lei", headerName: 'LEI', 
      },
      { field: "isCoinvestment", 
      },
      { field: "excludeFxExposure",
      },
      { field: "action", cellRenderer: 'actionCellRenderer'},
      { field: 'modifiedBy' },
      { field: 'modifiedOn', valueFormatter: dateTimeFormatter }
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
        Layout: {
          Revision: 8,
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
              'action'
      
            ],
            PinnedColumnsMap: {
              action: 'right'
            },
            ColumnWidthMap:{
              action: 150,
            },
            RowGroupedColumns: ['actionType', 'mappingID']            

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
          stagingData[i]['uniqueRowID'] = i+1;
        }

        console.log(stagingData)
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
