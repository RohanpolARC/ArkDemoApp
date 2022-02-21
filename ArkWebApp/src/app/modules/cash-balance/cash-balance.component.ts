import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { CashBalanceService } from 'src/app/core/services/CashBalance/cash-balance.service';
import { DataService } from 'src/app/core/services/data.service';

import {
  GridOptions,
  Module,
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import {
  AdaptableOptions,
  AdaptableApi,
} from '@adaptabletools/adaptable/types';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';

import { AsOfDate } from 'src/app/shared/models/FilterPaneModel';
import { dateFormatter, dateTimeFormatter, amountFormatter } from 'src/app/shared/functions/formatter';


@Component({
  selector: 'app-cash-balance',
  templateUrl: './cash-balance.component.html',
  styleUrls: ['./cash-balance.component.scss'],
})
export class CashBalanceComponent implements OnInit {

  searchDate: Date = null;
  sDate: AsOfDate = null;

  rowData: any[];
  rowGroupPanelShow:string = 'always';
  subscriptions: Subscription[] = [];

  gridApi;
  gridColumnApi;

  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];

  columnDefs = [
    {field: 'asofDate', headerName: 'As of Date', type: 'abColDefDate', valueFormatter: dateFormatter},
    {field: 'pbName', headerName: 'Fund Accounting', type: 'abColDefString'},
    {field: 'mapName', headerName: 'Map', type: 'abColDefString'},
    {field: 'account', headerName: 'Account', type:'abColDefNumber'},
    {field: 'accountDescription', headerName: 'Account Description', type:'abColDefString'},
    {field: 'currency', headerName: 'Currency', type: 'abColDefString'},
    {field: 'pbClosingBalance', headerName: 'PB Closing Balance', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'fundCcy', headerName: 'Fund Ccy', type: 'abColDefString'},
    {field: 'accountBalance', headerName: 'Account Balance', type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell', valueFormatter: amountFormatter},
    {field: 'accountBalanceBase', headerName: 'Account Balance Base', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'portfolioName', headerName: 'Portfolio', type: 'abColDefString'},
    {field: 'fundHedging', headerName: 'Fund Hedging', type:'abColDefString'},
    {field: 'fundLegalEntity', headerName: 'Fund Legal Entity', type: 'abColDefString'},
    {field: 'fund', headerName: 'Fund', type: 'abColDefString'},
    {field: 'fundStrategy', headerName: 'Fund Strategy', type: 'abColDefString'},
    {field: 'marketValueFactor', headerName: 'MV Factor', type:'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
    {field: 'accountBalanceEur', headerName: 'Account Balance Eur', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'mvFundHedging', headerName: 'MV FundHedging', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'mvLegalEntity', headerName: 'MV FundLegalEntity', type:'abColDefNumber', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
    {field: 'isSplited', headerName: 'IsSplited', type:'abColDefBoolean'},
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

  constructor(private cashBalanceService: CashBalanceService, private dataService: DataService) {
    
    this.gridOptions = {
      enableRangeSelection: false,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: false,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true
    }
   }

  ngOnInit(): void {
    this.rowData = [];

    this.subscriptions.push(this.dataService.currentSearchDate.subscribe(sDate => {
      this.sDate = sDate;
      if(this.sDate !== null)
        this.subscriptions.push(this.cashBalanceService.getCashBalance(this.sDate).subscribe({
          next: data => {
            this.rowData = data;
          },
          error: error => {
            console.error("Error in fetching Cash Balance Data" + error);
          }
      }));
      else
        console.warn("Component loaded without setting date in filter pane");
      }));
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public adaptableOptions: AdaptableOptions = {
   autogeneratePrimaryKey: true,
    primaryKey:'',
    userName: 'TestUser',
    adaptableId: "",
    adaptableStateKey: `Cash Balance Key`,

    toolPanelOptions: {
      toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
    },

    predefinedConfig: {
      Dashboard: {
        ModuleButtons: ['Export', 'Layout','ConditionalStyle'],
        IsCollapsed: true,
        Tabs: [],
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
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });

/* Closes right sidebar on start */
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  }
}
