
import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions,GridApi, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { CashFlowService } from 'src/app/core/services/CashFlows/cash-flow.service';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import {  BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER,  DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { LoadStatusType } from '../portfolio-modeller/portfolio-modeller.component';

@Component({
  selector: 'app-cash-flows',
  templateUrl: './cash-flows.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss','./cash-flows.component.scss']
})
export class CashFlowsComponent implements OnInit {

  @Input() runID: string;
  @Output() status = new EventEmitter<LoadStatusType>();
  
  subscriptions: Subscription[] = []
  columnDefs: ColDef[]
  gridOptions: GridOptions
  rowData: any

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  modelName: string
  baseMeasure: string
  asOfDate: string
  gridApi: GridApi;
  adaptableOptions: AdaptableOptions;
  adaptableApi: AdaptableApi;

  FX_COLUMNS:string[]=[
    'fxRate',
  'fxRateCapital',
  'fxRateIncome',
  'fxRateBase',
  'fxRateBaseCapital',
  'fxRateBaseIncome',
  'baseGIR',
  'baseGIRAsOfDate',
  'baseGIRTradeDate',
  'baseGIRWtAvgCommited',
  'baseGIRWtAvgFunded',
  'fxRateEur',
  'fxRateEurCapital',
  'fxRateEurIncome',
  'eurGIR',
  'eurGIRAsOfDate',
  'eurGIRTradeDate',
  'eurGIRWtAvgCommited',
  'eurGIRWtAvgFunded',
  'fxFWDRate',
  'actualFXRate',
  'translationFX',
  'eurBasisRate',
  'hedgeBasisRate',
  'hedgeFinancingRate',
  'eurFinancingRate',
  'effectiveFXRate'
  ]

  AMOUNT_COLUMNS:string[]=
  ['portfolioType',
  
  'principal',
  'principalIndexed',
  'pik',
  'repayment',
  'fwdCurve',
  'interest',
  'fees',
  'pikInterest',
  'purchaseDiscount',
  'marketValue',
  'accruedInterest',
  'accruedFees',
  'totalInterest',
  'totalIncome',
  'total',
  'totalEur',
  'totalBase',
  'feesCcy',
  'interestCcy',
  'repaymentCcy',
  'capitalInvestedCcy',

  'fxHedgeCost',
  'fxBasisCost',
  'actualCashBalance',

  'effectiveTotalEur',
  'marketValueDaily',

'marketValueDailyEur',
'faceValue',
'internalTradeTotal',
'internalTradeTotalEur'
];
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';

  constructor(
    private cashFlowService:CashFlowService,
    public irrCalcSvc: IRRCalcService,
    private dataSvc: DataService  
  ) { }



  ngOnInit(): void {

    this.irrCalcSvc.cashflowLoadStatusEvent.pipe(first()).subscribe({
      next:(e) => {
        if(e.status === 'Loaded'){

          this.cashFlowService.getCashFlows(this.runID).pipe(first()).subscribe({
            next: (d) => {
              this.rowData = d;
              this.adaptableApi.dashboardApi.setDashboardTitle(`Cashflows (${this.rowData.length})`)
              this.adaptableApi.dashboardApi.refreshDashboard()

              this.status.emit('Loaded')
            },
            error: (e) => {
              console.error(`Failed to get the cashflows: ${e}`)
              this.status.emit('Failed')
            }
          })
        }
      },
      error:(error)=>{
        console.error(`Failed to get Cashflows : ${error}`)
        this.rowData=[]
        this.status.emit('Failed')
      }
    })

    this.columnDefs = [
      { field: 'issuer', type: 'abColDefString' },
      { field: 'assetName', type: 'abColDefString' },
      { field: 'id', type: 'abColDefNumber', headerName: 'Position ID' },
      { field: 'portfolio', type: 'abColDefString' },
      { field: 'portfolioType', type: 'abColDefNumber' },
      { field: 'bookName', type: 'abColDefString' },
      { field: 'entity', type: 'abColDefString'},
      { field: 'cashDate', cellClass: 'dateUK', minWidth: 122, type: 'abColDefDate' },
      { field: 'fxRate', type: 'abColDefNumber' },
      { field: 'fxRateCapital', type: 'abColDefNumber' },
      { field: 'fxRateIncome', type: 'abColDefNumber' },
      { field: 'fxRateMethod', type: 'abColDefNumber' },
      { field: 'fxRateBase', type: 'abColDefNumber' },
      { field: 'fxRateBaseCapital', type: 'abColDefNumber' },
      { field: 'fxRateBaseIncome', type: 'abColDefNumber' },
      { field: 'baseGIR', type: 'abColDefNumber' },
      { field: 'baseGIRAsOfDate', type: 'abColDefNumber' },
      { field: 'baseGIRTradeDate', type: 'abColDefNumber' },
      { field: 'baseGIRWtAvgCommited', type: 'abColDefNumber' },
      { field: 'baseGIRWtAvgFunded', type: 'abColDefNumber' },
      { field: 'fxRateEur', type: 'abColDefNumber' },
      { field: 'fxRateEurCapital', type: 'abColDefNumber' },
      { field: 'fxRateEurIncome', type: 'abColDefNumber' },
      { field: 'eurGIR', type: 'abColDefNumber' },
      { field: 'eurGIRAsOfDate', type: 'abColDefNumber' },
      { field: 'eurGIRTradeDate', type: 'abColDefNumber' },
      { field: 'eurGIRWtAvgCommited', type: 'abColDefNumber' },
      { field: 'eurGIRWtAvgFunded', type: 'abColDefNumber' },
      { field: 'fxFWDRate', type: 'abColDefNumber', headerName: 'FX Forward Rate' },
      { field: 'principal', type: 'abColDefNumber' },
      { field: 'principalIndexed', type: 'abColDefNumber' },
      { field: 'pik', type: 'abColDefNumber', headerName: 'PIK' },
      { field: 'repayment', type: 'abColDefNumber' },
      { field: 'fwdCurve', type: 'abColDefNumber' },
      { field: 'interest', type: 'abColDefNumber' },
      { field: 'fees', type: 'abColDefNumber' },
      { field: 'pikInterest', type: 'abColDefNumber' },
      { field: 'purchaseDiscount', type: 'abColDefNumber' },
      { field: 'marketValue', type: 'abColDefNumber' },
      { field: 'accruedInterest', type: 'abColDefNumber' },
      { field: 'accruedFees', type: 'abColDefNumber' },
      { field: 'totalInterest', type: 'abColDefNumber' },
      { field: 'totalIncome', type: 'abColDefNumber' },
      { field: 'total', type: 'abColDefNumber' },
      { field: 'totalEur', type: 'abColDefNumber' },
      { field: 'totalBase', type: 'abColDefNumber' },
      { field: 'realized', type: 'abColDefNumber' },
      { field: 'isActual', type: 'abColDefBoolean' },
      { field: 'isVirtual', type: 'abColDefBoolean' },
      { field: 'isUnsettled', type: 'abColDefBoolean' },
      { field: 'isCurrent', type: 'abColDefBoolean' },
      { field: 'isExpected', type: 'abColDefBoolean' },
      { field: 'isWorst', type: 'abColDefBoolean' },
      { field: 'isExit', type: 'abColDefBoolean' },
      { field: 'isCustom', type: 'abColDefBoolean' },
      { field: 'isCashIRR', type: 'abColDefBoolean' },
      { field: 'isYTE', type: 'abColDefBoolean' },
      { field: 'isYTW', type: 'abColDefBoolean' },
      { field: 'feesCcy', type: 'abColDefNumber' },
      { field: 'interestCcy', type: 'abColDefNumber' },
      { field: 'repaymentCcy', type: 'abColDefNumber' },
      { field: 'capitalInvestedCcy', type: 'abColDefNumber' },
      { field: 'actualFXRate', type: 'abColDefNumber' },
      { field: 'fxHedgeCost', type: 'abColDefNumber' },
      { field: 'fxBasisCost', type: 'abColDefNumber' },
      { field: 'actualCashBalance', type: 'abColDefNumber' },
      { field: 'eurBasisRate', type: 'abColDefNumber' },
      { field: 'hedgeBasisRate', type: 'abColDefNumber' },
      { field: 'hedgeFinancingRate', type: 'abColDefNumber' },
      { field: 'eurFinancingRate', type: 'abColDefNumber' },
      { field: 'effectiveFXRate', type: 'abColDefNumber' },
      { field: 'effectiveTotalEur', type: 'abColDefNumber' },
      { field: 'translationFX', type: 'abColDefNumber' },
      { field: 'marketValueDaily', type: 'abColDefNumber' },
      { field: 'marketValueDailyEur', type: 'abColDefNumber' },
      { field: 'faceValue', type: 'abColDefNumber' },
      { field: 'useBaseFXRate', type: 'abColDefBoolean' },
      { field: 'internalTradeTotal', type: 'abColDefNumber' },
      { field: 'internalTradeTotalEur', type: 'abColDefNumber' },
      { field: 'currency', type: 'abColDefString' }
    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefs,
      rowData: this.rowData,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        lockPosition: true,
        enableValue: true
      },
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
        this.gridApi = params.api;   
      },
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Cashflows',
      adaptableStateKey: 'Cashflows Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      
      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',[...this.AMOUNT_COLUMNS]),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('fxFormatter',[...this.FX_COLUMNS])
        ]
      },

      predefinedConfig: {
        Dashboard: {
          Revision:6,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
        },
        Layout:{
          CurrentLayout: 'Basic Cashflows Layout',
          Revision: 3,
          Layouts: [{
            Name: 'Basic Cashflows Layout',
            Columns: this.columnDefs.map(def => def.field)
          }]
        },
        FormatColumn:{
          Revision:9,
          FormatColumns:[
            CUSTOM_FORMATTER([...this.AMOUNT_COLUMNS],['amountFormatter']),
            CUSTOM_FORMATTER([...this.FX_COLUMNS],['fxFormatter']),
            BLANK_DATETIME_FORMATTER_CONFIG(['cashDate']),
            DATE_FORMATTER_CONFIG_ddMMyyyy(['cashDate'])
          ]
        }
      }
    }

  }


  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi.dashboardApi.setDashboardTitle(`Cashflows`)


  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}

