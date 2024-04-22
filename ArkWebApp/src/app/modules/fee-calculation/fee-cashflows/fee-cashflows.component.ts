import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { AgChartThemeOverrides, BodyScrollEvent, ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, Module, ValueFormatterParams } from '@ag-grid-community/core';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { FeeCalculationService } from 'src/app/core/services/FeeCalculation/fee-calculation.service';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_ddMMyyyy, amountFormatter, dateFormatter } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, getMomentDateStr_ddmmyyyy, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { ParentTabType } from 'src/app/shared/models/IRRCalculationsModel';
import { PortfolioModellerService } from '../../irr-calculation/service/portfolio-modeller.service';
import { AgGridScrollService } from '../../irr-calculation/service/aggrid-scroll.service';
import { GridChartsModule } from "@ag-grid-enterprise/charts";

@Component({
  selector: 'app-fee-cashflows',
  templateUrl: './fee-cashflows.component.html',
  styleUrls: ['./fee-cashflows.component.scss'],
  providers: [AgGridScrollService]
})
export class FeeCashflowsComponent implements OnInit {

  @Input() feeCashflows;
  @Input() status: 'Loading' | 'Loaded' | 'Failed';
  @Input() parentTab: ParentTabType;
  @Input() childTabIndex: number;
  
  agGridModules: Module[] = [...CommonConfig.AG_GRID_MODULES,
    GridChartsModule]
  subscriptions: Subscription[] = []
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions
  columnDefs: ColDef[]
  defaultColDef: ColDef
  gridApi: GridApi
  adaptableApi: AdaptableApi
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';
  currentChartRef: any;

  constructor(
    private dataSvc: DataService,
    private feeCalcSvc: FeeCalculationService,
    public agGridScrollService:AgGridScrollService,
    private portfolioModellerService: PortfolioModellerService
  ) { }

  percentFormatter(params : ValueFormatterParams) {
    if(params.node.group)
      return " "
    else{
      return `${Number(params.value * 100).toFixed(2)}%`
    }
  }

  ngOnChanges(changes: SimpleChanges){

     if(changes?.['status'].currentValue){
      if(this.status === 'Loading')
        this.gridApi?.showLoadingOverlay();
      else 
        if(this.feeCashflows.length === 0){
          this.noRowsToDisplayMsg = 'No data found for applied filter.'
        }
        this.gridApi?.hideOverlay();
    }
  }

  DATE_COLUMNS=[
    'Date',
    'LocalLastMgmtFeeDate',
    'LocalLastHurdleCompoundDate']

    AMOUNT_COLUMNS=['TotalType',
    'LocalHurdleCompoundingAdjustment',
    'Total',
    'TotalAfterOtherExpenses',
    'TotalAfterMgmtFee',
    'TotalAfterFXHedging',
    'Capital',
    'LocalAvgTimeWeightCumCapital',
    'LocalAvgTimeWeightCumCapitalHurdle',
    'LocalCumCapital',
    'LocalCompoundingAdjustment',
    'Income',
    'LocalCumInterest',
    'MgmtFees',
    'PeriodPerfFees',
    'OtherExpenses',
    'SingleTranslationFX',
    'LocalTranslationFX',
    'LocalCumOtherExpenses',
    'PeriodHurdle',
    'LocalCumHurdle',
    'TotalHurdle',
    'NAV',
    'GAV',
    'NAVAboveHurdle',
    // 'NAVAboveHurdleActual',
    'MarketValue',
    'Cost',
    'TotalPnL',
    'FundFlow',
    'NetCashFlow',
    'FXHedgeCost',
    'LocalCumFXHedgeCost',
    // 'MgmtFeesActual',
    // 'LocalCumMgmtFeesActual',
    // 'FXHedgeCostActual',
    // 'LocalCumFXHedgeCostActual',
    // 'PerfFeesActual',
    // 'LocalCumPerfFeesActual',
    // 'OtherExpensesActual',
    // 'LocalCumOtherExpensesActual',
    'FinancingCost',
    'LocalCumFinancingCost',
    'Financing',
    'LocalCumFinancing',
    // 'TotalAfterMgmtFeeActual',
    // 'TotalAfterPerfFeeActual',
    // 'TotalAfterFXHedgingActual',
    // 'TotalAfterOtherExpensesActual',
    // 'TotalAfterFinancingCostActual',
    'TotalAfterFinancingCost',
    // 'NAVActual',
    'TotalAfterPerfFee',
    'LocalCumCapitalHurdle',
    'LocalCumIncome',
    'Interest',
    'LocalCumMgmtfees',
    'PerfFees','TotalAfterGIRAdjustment', 'GIRAdjustment']

  chartThemeOverrides:AgChartThemeOverrides = {
    // Series tooltip property is not available for common chart type so its defined specific to a chart type
    line: {
      series: {
        tooltip: {
          enabled: true,
          renderer: ({ datum, xKey, yKey }) => {
            return {
              content: `${getMomentDateStr_ddmmyyyy(datum[xKey]?.['value'])}: ${this.formatAmount(datum[yKey])}`,
            };
          },
        },
        marker: {
          enabled: false
        }
      },
    },
    common: {
      title: {
        enabled: true,
        text: 'Fee flows',
      },
      navigator: {
        enabled: true,
        height: 20,
        margin: 25,
      },
      axes: {
        time: {
          label: {
            rotation: 0,
            format: '%d %b',
          },
        },
        category: {
          label: {
            rotation: 0,
            formatter: dateFormatter
          },
        },
        number: {
          label: {
            formatter: amountFormatter
          },
        },
      },
    },
  };

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi
    adaptableApi.columnApi.autosizeAllColumns()
    this.agGridScrollService.gridApi = this.gridOptions.api
    this.agGridScrollService.childTabIndex = this.childTabIndex
    this.agGridScrollService.parentTabIndex = this.parentTab?.index
  }

  ngOnInit(): void {

    // matTabRemoved$ observable is updated on when a matTab is closed 
    // on the above event we update the parentTabIndex to the property in its associated agGridScrollService as the Scroll Service should have its latest index values to track scroll positions 
    this.subscriptions.push(this.portfolioModellerService.matTabRemoved$.subscribe( x => {
      this.agGridScrollService.parentTabIndex = this.parentTab.index
    }))
    
    this.columnDefs = [
      { field: 'Date', tooltipField:  'Date', cellClass: 'dateUK', minWidth: 122, type: 'abColDefDate' },
      { field: 'NumberDays', tooltipField:  'NumberDays', type: 'abColDefNumber' },
      { field: 'PresetName', tooltipField:  'PresetName', type: 'abColDefString' },
      { field: 'CashType', tooltipField:  'CashType', type:'abColDefString', maxWidth: 300 },
      { field: 'TotalType', tooltipField:  'TotalType', type: 'abColDefNumber' },
      { field: 'LocalLastMgmtFeeDate', tooltipField:  'LocalLastMgmtFeeDate', cellClass: 'dateUK', minWidth: 122, type: 'abColDefDate' },
      { field: 'LocalLastHurdleCompoundDate', tooltipField:  'LocalLastHurdleCompoundDate', cellClass: 'dateUK', minWidth: 122, type: 'abColDefDate' },
      { field: 'LocalHurdleCompoundingAdjustment', tooltipField:  'LocalHurdleCompoundingAdjustment', type: 'abColDefNumber' },
      { field: 'Total', tooltipField:  'Total', type: 'abColDefNumber' },
      { field: 'TotalAfterGIRAdjustment', tooltipField: 'TotalAfterGIRAdjustment', type: 'abColDefNumber' },
      { field: 'TotalAfterOtherExpenses', tooltipField:  'TotalAfterOtherExpenses', type: 'abColDefNumber' },
      { field: 'TotalAfterMgmtFee', tooltipField:  'TotalAfterMgmtFee', type: 'abColDefNumber' },
      { field: 'TotalAfterPerfFee', tooltipField:  'TotalAfterPerfFee' , type: 'abColDefNumber'},
      { field: 'TotalAfterFXHedging', tooltipField:  'TotalAfterFXHedging', type: 'abColDefNumber' },
      { field: 'GIRAdjustment', tooltipField: 'GIRAdjustment', type: 'abColDefNumber' },
      { field: 'Capital', tooltipField:  'Capital', type: 'abColDefNumber' },
      { field: 'LocalAvgTimeWeightCumCapital', tooltipField:  'LocalAvgTimeWeightCumCapital', type: 'abColDefNumber' },
      { field: 'LocalAvgTimeWeightCumCapitalHurdle', tooltipField:  'LocalAvgTimeWeightCumCapitalHurdle', type: 'abColDefNumber' },
      { field: 'LocalCumCapital', tooltipField:  'LocalCumCapital', type: 'abColDefNumber' },
      { field: 'LocalCumCapitalHurdle', tooltipField:  'LocalCumCapitalHurdle' , type: 'abColDefNumber'},
      { field: 'LocalCompoundingAdjustment', tooltipField:  'LocalCompoundingAdjustment', type: 'abColDefNumber' },
      { field: 'Income', tooltipField:  'Income', type: 'abColDefNumber' },
      { field: 'LocalCumIncome', tooltipField:  'LocalCumIncome' , type: 'abColDefNumber'},
      { field: 'Interest', tooltipField:  'Interest' , type: 'abColDefNumber'},
      { field: 'LocalCumInterest', tooltipField:  'LocalCumInterest', type: 'abColDefNumber' },
      { field: 'MgmtFees', tooltipField:  'MgmtFees', type: 'abColDefNumber' },
      { field: 'LocalCumMgmtfees', tooltipField:  'LocalCumMgmtfees' , type: 'abColDefNumber'},
      { field: 'PeriodPerfFees', tooltipField:  'PeriodPerfFees', type: 'abColDefNumber' },
      { field: 'PerfFees', tooltipField:  'PerfFees' , type: 'abColDefNumber'},
      { field: 'OtherExpenses', tooltipField:  'OtherExpenses', type: 'abColDefNumber' },
      // { field: 'SingleTranslationFX', tooltipField:  'SingleTranslationFX', type: 'abColDefNumber' },
      // { field: 'LocalTranslationFX', tooltipField:  'LocalTranslationFX', type: 'abColDefNumber' },
      { field: 'LocalCumOtherExpenses', tooltipField:  'LocalCumOtherExpenses', type: 'abColDefNumber' },
      { field: 'PeriodHurdle', tooltipField:  'PeriodHurdle', type: 'abColDefNumber' },
      { field: 'LocalCumHurdle', tooltipField:  'LocalCumHurdle', type: 'abColDefNumber' },
      { field: 'TotalHurdle', tooltipField:  'TotalHurdle', type: 'abColDefNumber' },
      { field: 'NAV', tooltipField:  'NAV', type: 'abColDefNumber' },
      { field: 'GAV', tooltipField:  'GAV', type: 'abColDefNumber' },
      { field: 'NAVAboveHurdle', tooltipField:  'NAVAboveHurdle', type: 'abColDefNumber' },
      // { field: 'NAVAboveHurdleActual', tooltipField:  'NAVAboveHurdleActual', type: 'abColDefNumber' },
      { field: 'MarketValue', tooltipField:  'MarketValue', type: 'abColDefNumber' },
      { field: 'Cost', tooltipField:  'Cost', type: 'abColDefNumber' },
      { field: 'TotalPnL', tooltipField:  'TotalPnL', type: 'abColDefNumber' },
      { field: 'FundFlow', tooltipField:  'FundFlow', type: 'abColDefNumber' },
      { field: 'NetCashFlow', tooltipField:  'NetCashFlow', type: 'abColDefNumber' },
      { field: 'FXHedgeCost', tooltipField:  'FXHedgeCost', type: 'abColDefNumber' },
      { field: 'LocalCumFXHedgeCost', tooltipField:  'LocalCumFXHedgeCost', type: 'abColDefNumber' },
      // { field: 'MgmtFeesActual', tooltipField:  'MgmtFeesActual', type: 'abColDefNumber' },
      // { field: 'LocalCumMgmtFeesActual', tooltipField:  'LocalCumMgmtFeesActual', type: 'abColDefNumber' },
      // { field: 'FXHedgeCostActual', tooltipField:  'FXHedgeCostActual', type: 'abColDefNumber' },
      // { field: 'LocalCumFXHedgeCostActual', tooltipField:  'LocalCumFXHedgeCostActual', type: 'abColDefNumber' },
      // { field: 'PerfFeesActual', tooltipField:  'PerfFeesActual', type: 'abColDefNumber' },
      // { field: 'LocalCumPerfFeesActual', tooltipField:  'LocalCumPerfFeesActual', type: 'abColDefNumber' },
      // { field: 'OtherExpensesActual', tooltipField:  'OtherExpensesActual', type: 'abColDefNumber' },
      // { field: 'LocalCumOtherExpensesActual', tooltipField:  'LocalCumOtherExpensesActual', type: 'abColDefNumber' },
      { field: 'FinancingCost', tooltipField:  'FinancingCost', type: 'abColDefNumber' },
      { field: 'LocalCumFinancingCost', tooltipField:  'LocalCumFinancingCost', type: 'abColDefNumber' },
      { field: 'Financing', tooltipField:  'Financing', type: 'abColDefNumber' },
      { field: 'LocalCumFinancing', tooltipField:  'LocalCumFinancing', type: 'abColDefNumber' },
      // { field: 'TotalAfterMgmtFeeActual', tooltipField:  'TotalAfterMgmtFeeActual', type: 'abColDefNumber' },
      // { field: 'TotalAfterPerfFeeActual', tooltipField:  'TotalAfterPerfFeeActual', type: 'abColDefNumber' },
      // { field: 'TotalAfterFXHedgingActual', tooltipField:  'TotalAfterFXHedgingActual', type: 'abColDefNumber' },
      // { field: 'TotalAfterOtherExpensesActual', tooltipField:  'TotalAfterOtherExpensesActual', type: 'abColDefNumber' },
      // { field: 'TotalAfterFinancingCostActual', tooltipField:  'TotalAfterFinancingCostActual', type: 'abColDefNumber' },
      // { field: 'TotalAfterFinancingCost', tooltipField:  'TotalAfterFinancingCost', type: 'abColDefNumber' },
      // { field: 'NAVActual', tooltipField:  'NAVActual', type: 'abColDefNumber' },
      { field: 'scale', tooltipField:  'scale', type: 'abColDefNumber' },
    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      enableCharts: true,
      chartThemeOverrides: this.chartThemeOverrides,
      enableRangeSelection: true,
      popupParent: document.querySelector('body'),
      sideBar:true,
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true
      },
      rowHeight: 30,
      groupHeaderHeight: 30,
      headerHeight: 30,
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel();
        this.gridApi = params.api;   
        this.feeCalcSvc.feeCalcCashflowsGridApi = params.api;    
        if(this.status === 'Loading'){
          this.gridApi.showLoadingOverlay();
        } 
      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
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
      adaptableId: 'Fee Cashflows',
      adaptableStateKey: 'Fee Cashflows Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      formatColumnOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS)
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision:4,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: 'Fee Cashflows'
        },
        Charting: {
          Revision: 7,
          ChartDefinitions: [
            {
              Name:'Fee flows',
              Model:{
                modelType: 'range',
                chartType:'line',
                chartId:'feeCashflows',
                cellRange: {
                  rowStartIndex: 0,
                  rowEndIndex: null,
                  columns: ['Date', 'LocalAvgTimeWeightCumCapital','LocalCumCapital','LocalCumCapitalHurdle','PerfFees'],
                },
                chartOptions:this.chartThemeOverrides,
                suppressChartRanges:true
              }
    
            }
          ]

        },
        Layout:{
          Revision: 2,
          CurrentLayout: 'Basic Fee Cashflow Layout',
          Layouts: [{
            Name: 'Basic Fee Cashflow Layout',
            Columns: this.columnDefs.map(def => def.field)
          }]
        },
        FormatColumn:{
          Revision:3,
          FormatColumns:[
            BLANK_DATETIME_FORMATTER_CONFIG(this.DATE_COLUMNS),
            DATE_FORMATTER_CONFIG_ddMMyyyy(this.DATE_COLUMNS),
            CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,'amountFormatter')
          ]
        },
        StatusBar: {
          Revision: 3,
          StatusBars: [
            {
              Key: 'Center Panel',
              StatusBarPanels: ['Filter','Charting']
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

  formatAmount(amount:string){
    if(amount!=undefined && Number(Number(amount).toFixed(2))!=0){
      if(Number.isInteger(Number(Number(amount).toFixed(2)))){         // Don't show trailing 0's if number rounded off to 2 decimals is an integer
          return Number(amount).toLocaleString(undefined,{
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
          })
      }
      else{
          return Number(amount).toLocaleString(undefined, {     // Show 2 trailing digits if non integer
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
          });    
      }
    }
    else if(Number(Number(amount).toFixed(2))==0) {
        return "-"
    } else{
        return ""
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
