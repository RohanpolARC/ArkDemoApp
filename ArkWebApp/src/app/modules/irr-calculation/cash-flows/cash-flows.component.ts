
import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions,GridApi, GridReadyEvent, Module, FirstDataRenderedEvent, ProcessCellForExportParams, BodyScrollEvent } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { CashFlowService } from 'src/app/core/services/CashFlows/cash-flow.service';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER,  DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized,  getMomentDateStrFormat, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { LoadStatus, ParentTabType, ScrollPosition } from 'src/app/shared/models/IRRCalculationsModel';
import { PortfolioModellerService } from '../service/portfolio-modeller.service';
import { AgGridScrollService } from '../service/aggrid-scroll.service';

@Component({
  selector: 'app-cash-flows',
  templateUrl: './cash-flows.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss','./cash-flows.component.scss'],
  providers: [AgGridScrollService]
})
export class CashFlowsComponent implements OnInit {

  @Input() runID: string;
  @Input() parentTab: ParentTabType;
  @Input() childTabIndex: number;
  @Output() status = new EventEmitter<LoadStatus>();
  
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
    private dataSvc: DataService,
    public portfolioModellerService:PortfolioModellerService,
    public agGridScrollService:AgGridScrollService
  ) { }



  ngOnInit(): void {

    // matTabRemoved$ observable is updated on when a matTab is closed 
    // on the above event we update the parentTabIndex to the property in its associated agGridScrollService as the Scroll Service should have its latest index values to track scroll positions 
    this.subscriptions.push(this.portfolioModellerService.matTabRemoved$.subscribe( x => {
      this.agGridScrollService.parentTabIndex = this.parentTab.index
    }))

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
      { field: 'cashDate', cellClass: 'dateUK',  type: 'abColDefDate' },
      { field: 'fxRate', type: 'abColDefNumber' },
      { field: 'fxRateCapital', type: 'abColDefNumber' },
      { field: 'fxRateIncome', type: 'abColDefNumber' },
      { field: 'fxRateMethod', type: 'abColDefNumber', hide: true },
      { field: 'fxRateBase', type: 'abColDefNumber', hide: true },
      { field: 'fxRateBaseCapital', type: 'abColDefNumber', hide: true },
      { field: 'fxRateBaseIncome', type: 'abColDefNumber', hide: true },
      { field: 'baseGIR', type: 'abColDefNumber', hide: true },
      { field: 'baseGIRAsOfDate', type: 'abColDefNumber', hide: true },
      { field: 'baseGIRTradeDate', type: 'abColDefNumber', hide: true },
      { field: 'baseGIRWtAvgCommited', type: 'abColDefNumber', hide: true },
      { field: 'baseGIRWtAvgFunded', type: 'abColDefNumber', hide: true },
      { field: 'fxRateEur', type: 'abColDefNumber', hide: true },
      { field: 'fxRateEurCapital', type: 'abColDefNumber', hide: true },
      { field: 'fxRateEurIncome', type: 'abColDefNumber', hide: true },
      { field: 'eurGIR', type: 'abColDefNumber', hide: true },
      { field: 'eurGIRAsOfDate', type: 'abColDefNumber', hide: true },
      { field: 'eurGIRTradeDate', type: 'abColDefNumber', hide: true },
      { field: 'eurGIRWtAvgCommited', type: 'abColDefNumber', hide: true },
      { field: 'eurGIRWtAvgFunded', type: 'abColDefNumber', hide: true },
      { field: 'fxFWDRate', type: 'abColDefNumber', hide: true, headerName: 'FX Forward Rate' },
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
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
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
      rowHeight: 30,
      groupHeaderHeight: 30,
      headerHeight: 30,
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
        this.gridApi = params.api;   
      },
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
      processCellForClipboard(params: ProcessCellForExportParams) {
        if(params.column.getColId()==='cashDate')
          return getMomentDateStrFormat(params.value,'DD/MM/YYYY')
        return params.value;
      },      
      rowBuffer:0,
      onBodyScroll: (event:BodyScrollEvent) => {
        this.agGridScrollService.onAgGridScroll(event)
      }
    }

    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
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
          Revision: 4,
          Layouts: [{
            Name: 'Basic Cashflows Layout',
            Columns: this.columnDefs.filter(def => !def.hide).map(def => def.field)
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
        },
        StatusBar: {
          Revision: 2,
          StatusBars: [
            {
              Key: 'Center Panel',
              StatusBarPanels: ['Filter']
            },
            {
              Key: 'Right Panel',
              StatusBarPanels: ['StatusBar','CellSummary','Layout','Export'],
            },
          ],
        }
      }
    }

  }


  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi.dashboardApi.setDashboardTitle(`Cashflows`)
    this.agGridScrollService.gridApi = this.gridOptions.api
    this.agGridScrollService.childTabIndex = this.childTabIndex
    this.agGridScrollService.parentTabIndex = this.parentTab.index
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}

