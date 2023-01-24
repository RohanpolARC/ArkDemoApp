import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CashBalanceService } from 'src/app/core/services/CashBalance/cash-balance.service';
import { DataService } from 'src/app/core/services/data.service';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';
import { dateFormatter, amountFormatter, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_ddMMyyyy, BLANK_DATETIME_FORMATTER_CONFIG } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { AdaptableOptions, AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { CommonConfig } from 'src/app/configs/common-config';
import { ColDef, ColumnApi, GridApi, GridOptions, Module } from '@ag-grid-community/core';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

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
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  noRowsToDisplayMsg:NoRowsCustomMessages = 'Please apply the filter.'


  AMOUNT_COLUMNS=[
    'pbClosingBalance',
    'accountBalance',
    'accountBalanceBase',
    'accountBalanceEur',
    'mvFundHedging',
    'mvLegalEntity'
  ]

  columnDefs: ColDef[] = [
    { field: 'asofDate', headerName: 'As of Date', type: 'abColDefDate', cellClass: 'dateUK' },
    { field: 'pbName', headerName: 'Fund Accounting', type: 'abColDefString' },
    { field: 'mapName', headerName: 'Map', type: 'abColDefString' },
    { field: 'account', headerName: 'Account', type:'abColDefNumber' },
    { field: 'accountDescription', headerName: 'Account Description', type:'abColDefString' },
    { field: 'currency', headerName: 'Currency', type: 'abColDefString' },
    { field: 'pbClosingBalance', headerName: 'PB Closing Balance', type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
    { field: 'fundCcy', headerName: 'Fund Ccy', type: 'abColDefString' },
    { field: 'accountBalance', headerName: 'Account Balance', type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
    { field: 'accountBalanceBase', headerName: 'Account Balance Base', type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
    { field: 'portfolioName', headerName: 'Portfolio', type: 'abColDefString' },
    { field: 'fundHedging', headerName: 'Fund Hedging', type:'abColDefString' },
    { field: 'fundLegalEntity', headerName: 'Fund Legal Entity', type: 'abColDefString' },
    { field: 'fund', headerName: 'Fund', type: 'abColDefString' },
    { field: 'fundStrategy', headerName: 'Fund Strategy', type: 'abColDefString' },
    { field: 'marketValueFactor', headerName: 'MV Factor', type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
    { field: 'accountBalanceEur', headerName: 'Account Balance Eur', type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
    { field: 'mvFundHedging', headerName: 'MV FundHedging', type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
    { field: 'mvLegalEntity', headerName: 'MV FundLegalEntity', type:'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
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
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },

    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey:'',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: "Cash Balance",
      adaptableStateKey: `Cash Balance Key`,
      
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,


      // toolPanelOptions: {
      //   toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
      // },
  
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },

      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS)
        ]
      },
  
      predefinedConfig: {
        Dashboard: {
          Revision: 1,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
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
        },
        FormatColumn:{
          Revision:2,
          FormatColumns:[
            CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,'amountFormatter'),
            DATE_FORMATTER_CONFIG_ddMMyyyy(['asofDate']),
            
          ]
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
              if(data.length === 0){
                this.noRowsToDisplayMsg = 'No data found for applied filter.'
              }
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

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
  };
}