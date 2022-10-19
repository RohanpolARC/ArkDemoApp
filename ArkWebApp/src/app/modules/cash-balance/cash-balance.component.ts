import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CashBalanceService } from 'src/app/core/services/CashBalance/cash-balance.service';
import { DataService } from 'src/app/core/services/data.service';
import {
  ColDef,
  ColumnApi,
  GridApi,
  GridOptions,
  Module,
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';
import { dateFormatter, amountFormatter } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { AdaptableOptions, AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { FiltersToolPanelModule, ClipboardModule, SideBarModule, RangeSelectionModule } from '@ag-grid-enterprise/all-modules';
import { CommonConfig } from 'src/app/configs/common-config';

@Component({
  selector: 'app-cash-balance',
  templateUrl: './cash-balance.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './cash-balance.component.scss'],
})

export class CashBalanceComponent implements OnInit {

  searchDate: Date = null;
  sDate: AsOfDateRange = null;
  rowData: any[];
  rowGroupPanelShow: string = 'always';
  subscriptions: Subscription[] = [];
  gridApi: GridApi;
  gridColumnApi: ColumnApi;
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
    RangeSelectionModule ];

  columnDefs: ColDef[] = [
    { field: 'asofDate', headerName: 'As of Date', type: 'abColDefDate', valueFormatter: dateFormatter },
    { field: 'pbName', headerName: 'Fund Accounting', type: 'abColDefString' },
    { field: 'mapName', headerName: 'Map', type: 'abColDefString' },
    { field: 'account', headerName: 'Account', type:'abColDefNumber' },
    { field: 'accountDescription', headerName: 'Account Description', type:'abColDefString' },
    { field: 'currency', headerName: 'Currency', type: 'abColDefString' },
    { field: 'pbClosingBalance', headerName: 'PB Closing Balance', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
    { field: 'fundCcy', headerName: 'Fund Ccy', type: 'abColDefString' },
    { field: 'accountBalance', headerName: 'Account Balance', type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', valueFormatter: amountFormatter },
    { field: 'accountBalanceBase', headerName: 'Account Balance Base', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
    { field: 'portfolioName', headerName: 'Portfolio', type: 'abColDefString' },
    { field: 'fundHedging', headerName: 'Fund Hedging', type:'abColDefString' },
    { field: 'fundLegalEntity', headerName: 'Fund Legal Entity', type: 'abColDefString' },
    { field: 'fund', headerName: 'Fund', type: 'abColDefString' },
    { field: 'fundStrategy', headerName: 'Fund Strategy', type: 'abColDefString' },
    { field: 'marketValueFactor', headerName: 'MV Factor', type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
    { field: 'accountBalanceEur', headerName: 'Account Balance Eur', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
    { field: 'mvFundHedging', headerName: 'MV FundHedging', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
    { field: 'mvLegalEntity', headerName: 'MV FundLegalEntity', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
    { field: 'isSplited', headerName: 'IsSplited', type:'abColDefBoolean' },
  ];

  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortable: true,
    filter: true,
    autosize:true,
  };
  gridOptions: GridOptions;
  adaptableOptions: AdaptableOptions;

  constructor(private cashBalanceSvc: CashBalanceService,
    private dataSvc: DataService) {
    
    this.gridOptions = {
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: false,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true
    }

    this.adaptableOptions = {
      autogeneratePrimaryKey: true,
      primaryKey:'',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: "Cash Balance",
      adaptableStateKey: `Cash Balance Key`,
      
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,


      toolPanelOptions: {
        toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
      },
  
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
  
      predefinedConfig: {
        Dashboard: {
          ModuleButtons: ['TeamSharing','Export', 'Layout','ConditionalStyle'],
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],
          DashboardTitle: ' '
        },
        Layout: {
          CurrentLayout: 'Basic Cash Flow',
          Layouts: [{
            Name: 'Basic Cash Flow',
            Columns: [
              'asofDate',
              'account',
              'accountDescription',
              'pbName',
              'mapName',
              'currency',
              'pbClosingBalance',
              'fundCcy',
              'accountBalance',
              'accountBalanceBase',
              'accountBalanceEur',
              'portfolioName',
              'fundHedging',
              'fundLegalEntity',
              'fund',
              'fundStrategy',
              'isSplited'
            ],
            RowGroupedColumns : [],
          }]
        }
      }
    }
  
   }

  ngOnInit(): void {
    this.rowData = [];

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        if(this.sDate !== null){
          this.subscriptions.push(this.cashBalanceSvc.getCashBalance(this.sDate).subscribe({
            next: data => {
              this.rowData = data;
            },
            error: error => {
              console.error("Error in fetching Cash Balance Data" + error);
            }
        }));  
      }
      else
        console.warn("Component loaded without setting date in filter pane");
      }
    }))

    this.subscriptions.push(this.cashBalanceSvc.currentSearchDateRange.subscribe(sDate => {
      this.sDate = sDate;
    }))
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
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
/* Closes right sidebar on start */
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }
}