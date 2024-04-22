import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm, DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

@Injectable()
export class PoscashGridConfigService {
  adaptableOptions: AdaptableOptions
  gridOptions: GridOptions
  columnDefs: ColDef[]
  gridApi : GridApi
  adaptableApi: AdaptableApi
  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';

  AMOUNT_COLUMNS = [
    'baseGIR',
    'baseGIRAsOfDate',
    'baseGIRTradeDate',
    'baseGIRWtAvgCommited',
    'baseGIRWtAvgFunded',
    'eurGIR',
    'eurGIRAsOfDate',
    'eurGIRTradeDate',
    'eurGIRWtAvgCommited',
    'eurGIRWtAvgFunded',
    'principal',
    'principalIndexed',
    'pik',
    'repayment',
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
    'realized',
    'feesCcy',
    'interestCcy',
    'repaymentCcy',
    'capitalInvestedCcy',
    'actualCashBalance',
    'eurBasisRate',
    'hedgeBasisRate',
    'hedgeFinancingRate',
    'eurFinancingRate',
    'effectiveTotalEur',
    'marketValueDaily',
    'marketValueDailyEur',
    'faceValue',
    'internalTradeTotal',
    'internalTradeTotalEur',
    'feesEur',
    'capitalInvestedEur',
    'capitalReturnEur',
    'incomeEur',
    'capitalInvestedBase',
    'capitalReturnBase',
    'incomeBase',
    'capitalInvested',
    'capitalReturn',
    'income',
    'fxRateEurTradeDate',
    'fxRateBaseTradeDate',
    'extractId',
    'realisedEur',
    'realisedInterestEur',
    'realisedFeesEur',
    'totalEurUnrealisedGain',
    'totalEurNoInterest',
    'totalEurNoFees'
  ]


  constructor(private dataSvc: DataService) 
  {
    this.init()
  }
  
  init()
  {
    this.columnDefs = [
      { field: 'issuer', tooltipField: 'issuer', headerName: 'Issuer', type:'abColDefString'},
      { field: 'assetName', tooltipField: 'assetName', headerName: 'Asset Name', type:'abColDefString'},
      { field: 'id', tooltipField: 'id', headerName: 'Position ID', type:'abColDefNumber'},
      { field: 'portfolio', tooltipField: 'portfolio', headerName: 'Portfolio', type:'abColDefString'},
      { field: 'portfolioType', tooltipField: 'portfolioType', headerName: 'Portfolio Type', type:'abColDefNumber'},
      { field: 'bookName', tooltipField: 'bookName', headerName: 'Book Name', type:'abColDefString'},
      { field: 'entity', tooltipField: 'entity', headerName: 'Entity', type:'abColDefString'},
      { field: 'cashDate', tooltipField: 'cashDate', headerName: 'Cash Date', type:'abColDefDate', cellClass: 'dateUK'},
      { field: 'fxRate', tooltipField: 'fxRate', headerName: 'FX Rate', type:'abColDefNumber'},
      { field: 'fxRateCapital', tooltipField: 'fxRateCapital', headerName: 'FX Rate Capital', type:'abColDefNumber'},
      { field: 'fxRateIncome', tooltipField: 'fxRateIncome', headerName: 'FX Rate Income', type:'abColDefNumber'},
      { field: 'fxRateMethod', tooltipField: 'fxRateMethod', headerName: 'FX Rate Method', type:'abColDefNumber'},
      { field: 'fxRateBase', tooltipField: 'fxRateBase', headerName: 'FX Rate Base', type:'abColDefNumber'},
      { field: 'fxRateBaseCapital', tooltipField: 'fxRateBaseCapital', headerName: 'FX Rate Base Capital', type:'abColDefNumber'},
      { field: 'fxRateBaseIncome', tooltipField: 'fxRateBaseIncome', headerName: 'FX Rate Base Income', type:'abColDefNumber'},
      { field: 'baseGIR', tooltipField: 'baseGIR', headerName: 'Base GIR', type:'abColDefNumber'},
      { field: 'baseGIRAsOfDate', tooltipField: 'baseGIRAsOfDate', headerName: 'Base GIR AsOfDate', type:'abColDefNumber'},
      { field: 'baseGIRTradeDate', tooltipField: 'baseGIRTradeDate', headerName: 'Base GIR Trade Date', type:'abColDefNumber'},
      { field: 'baseGIRWtAvgCommited', tooltipField: 'baseGIRWtAvgCommited', headerName: 'Base GIR Wt Avg Committed', type:'abColDefNumber'},
      { field: 'baseGIRWtAvgFunded', tooltipField: 'baseGIRWtAvgFunded', headerName: 'Base GIR Wt Avg Funded', type:'abColDefNumber'},
      { field: 'fxRateEur', tooltipField: 'fxRateEur', headerName: 'FX Rate Eur', type:'abColDefNumber'},
      { field: 'fxRateEurCapital', tooltipField: 'fxRateEurCapital', headerName: 'FX Rate Eur Capital', type:'abColDefNumber'},
      { field: 'fxRateEurIncome', tooltipField: 'fxRateEurIncome', headerName: 'FX Rate Eur Income', type:'abColDefNumber'},
      { field: 'eurGIR', tooltipField: 'eurGIR', headerName: 'Eur GIR', type:'abColDefNumber'},
      { field: 'eurGIRAsOfDate', tooltipField: 'eurGIRAsOfDate', headerName: 'Eur GIR AsOfDate', type:'abColDefNumber'},
      { field: 'eurGIRTradeDate', tooltipField: 'eurGIRTradeDate', headerName: 'Eur GIR Trade Date', type:'abColDefNumber'},
      { field: 'eurGIRWtAvgCommited', tooltipField: 'eurGIRWtAvgCommited', headerName: 'Eur GIR Wt Avg Commited', type:'abColDefNumber'},
      { field: 'eurGIRWtAvgFunded', tooltipField: 'eurGIRWtAvgFunded', headerName: 'Eur GIR Wt Avg Funded', type:'abColDefNumber'},
      { field: 'fXfwdRate', tooltipField: 'fXfwdRate', headerName: 'FX FWD Rate', type:'abColDefNumber'},
      { field: 'principal', tooltipField: 'principal', headerName: 'Principal', type:'abColDefNumber'},
      { field: 'principalIndexed', tooltipField: 'principalIndexed', headerName: 'Principal Indexed', type:'abColDefNumber'},
      { field: 'pik', tooltipField: 'pik', headerName: 'Pik', type:'abColDefNumber'},
      { field: 'repayment', tooltipField: 'repayment', headerName: 'Repayment', type:'abColDefNumber'},
      { field: 'fwdCurve', tooltipField: 'fwdCurve', headerName: 'Fwd Curve', type:'abColDefNumber'},
      { field: 'interest', tooltipField: 'interest', headerName: 'Interest', type:'abColDefNumber'},
      { field: 'fees', tooltipField: 'fees', headerName: 'Fees', type:'abColDefNumber'},
      { field: 'pikInterest', tooltipField: 'pikInterest', headerName: 'Pik Interest', type:'abColDefNumber'},
      { field: 'purchaseDiscount', tooltipField: 'purchaseDiscount', headerName: 'Purchase Discount', type:'abColDefNumber'},
      { field: 'marketValue', tooltipField: 'marketValue', headerName: 'Market Value', type:'abColDefNumber'},
      { field: 'accruedInterest', tooltipField: 'accruedInterest', headerName: 'Accrued Interest', type:'abColDefNumber'},
      { field: 'accruedFees', tooltipField: 'accruedFees', headerName: 'Accrued Fees', type:'abColDefNumber'},
      { field: 'totalInterest', tooltipField: 'totalInterest', headerName: 'Total Interest', type:'abColDefNumber'},
      { field: 'totalIncome', tooltipField: 'totalIncome', headerName: 'Total Income', type:'abColDefNumber'},
      { field: 'total', tooltipField: 'total', headerName: 'Total', type:'abColDefNumber'},
      { field: 'totalEur', tooltipField: 'totalEur', headerName: 'Total Eur', type:'abColDefNumber'},
      { field: 'totalBase', tooltipField: 'totalBase', headerName: 'Total Base', type:'abColDefNumber'},
      { field: 'realized', tooltipField: 'realized', headerName: 'Realized', type:'abColDefNumber'},
      { field: 'isActual', tooltipField: 'isActual', headerName: 'Is Actual', type:'abColDefString'},
      { field: 'isVirtual', tooltipField: 'isVirtual', headerName: 'Is Virtual', type:'abColDefString'},
      { field: 'isUnsettled', tooltipField: 'isUnsettled', headerName: 'Is Unsettled', type:'abColDefString'},
      { field: 'isCurrent', tooltipField: 'isCurrent', headerName: 'Is Current', type:'abColDefString'},
      { field: 'isExpected', tooltipField: 'isExpected', headerName: 'Is Expected', type:'abColDefString'},
      { field: 'isWorst', tooltipField: 'isWorst', headerName: 'Is Worst', type:'abColDefString'},
      { field: 'isExit', tooltipField: 'isExit', headerName: 'Is Exit', type:'abColDefString'},
      { field: 'isCustom', tooltipField: 'isCustom', headerName: 'Is Custom', type:'abColDefString'},
      { field: 'isCashIRR', tooltipField: 'isCashIRR', headerName: 'Is Cash IRR', type:'abColDefString'},
      { field: 'isYTE', tooltipField: 'isYTE', headerName: 'Is YTE', type:'abColDefString'},
      { field: 'isYTW', tooltipField: 'isYTW', headerName: 'Is YTW', type:'abColDefString'},
      { field: 'feesCcy', tooltipField: 'feesCcy', headerName: 'Fees Ccy', type:'abColDefNumber'},
      { field: 'interestCcy', tooltipField: 'interestCcy', headerName: 'Interest Ccy', type:'abColDefNumber'},
      { field: 'repaymentCcy', tooltipField: 'repaymentCcy', headerName: 'Repayment Ccy', type:'abColDefNumber'},
      { field: 'capitalInvestedCcy', tooltipField: 'capitalInvestedCcy', headerName: 'Capital Invested Ccy', type:'abColDefNumber'},
      { field: 'actualFXRate', tooltipField: 'actualFXRate', headerName: 'Actual FX Rate', type:'abColDefNumber'},
      { field: 'fxHedgeCost', tooltipField: 'fxHedgeCost', headerName: 'FX Hedge Cost', type:'abColDefNumber'},
      { field: 'fxBasisCost', tooltipField: 'fxBasisCost', headerName: 'FX Basis Cost', type:'abColDefNumber'},
      { field: 'actualCashBalance', tooltipField: 'actualCashBalance', headerName: 'Actual Cash Balance', type:'abColDefNumber'},
      { field: 'eurBasisRate', tooltipField: 'eurBasisRate', headerName: 'Eur Basis Rate', type:'abColDefNumber'},
      { field: 'hedgeBasisRate', tooltipField: 'hedgeBasisRate', headerName: 'Hedge Basis Rate', type:'abColDefNumber'},
      { field: 'hedgeFinancingRate', tooltipField: 'hedgeFinancingRate', headerName: 'Hedge Financing Rate', type:'abColDefNumber'},
      { field: 'eurFinancingRate', tooltipField: 'eurFinancingRate', headerName: 'Eur Financing Rate', type:'abColDefNumber'},
      { field: 'effectiveFXRate', tooltipField: 'effectiveFXRate', headerName: 'Effective FX Rate', type:'abColDefNumber'},
      { field: 'effectiveTotalEur', tooltipField: 'effectiveTotalEur', headerName: 'Effective Total Eur', type:'abColDefNumber'},
      { field: 'translationFX', tooltipField: 'translationFX', headerName: 'Translation FX', type:'abColDefNumber'},
      { field: 'marketValueDaily', tooltipField: 'marketValueDaily', headerName: 'Market Value Daily', type:'abColDefNumber'},
      { field: 'marketValueDailyEur', tooltipField: 'marketValueDailyEur', headerName: 'Market Value Daily Eur', type:'abColDefNumber'},
      { field: 'faceValue', tooltipField: 'faceValue', headerName: 'Face Value', type:'abColDefNumber'},
      { field: 'useBaseFXRate', tooltipField: 'useBaseFXRate', headerName: 'Use Base FX Rate', type:'abColDefString'},
      { field: 'internalTradeTotal', tooltipField: 'internalTradeTotal', headerName: 'Internal Trade Total', type:'abColDefNumber'},
      { field: 'internalTradeTotalEur', tooltipField: 'internalTradeTotalEur', headerName: 'Internal Trade Total Eur', type:'abColDefNumber'},
      { field: 'asOfDate', tooltipField: 'asOfDate', headerName: 'As Of Date', type:'abColDefDate', cellClass: 'dateUK'},
      { field: 'currency', tooltipField: 'currency', headerName: 'Currency', type:'abColDefString'},
      { field: 'feesEur', tooltipField: 'feesEur', headerName: 'Fees Eur', type:'abColDefNumber'},
      { field: 'capitalInvestedEur', tooltipField: 'capitalInvestedEur', headerName: 'Capital Invested Eur', type:'abColDefNumber'},
      { field: 'capitalReturnEur', tooltipField: 'capitalReturnEur', headerName: 'Capital Return Eur', type:'abColDefNumber'},
      { field: 'incomeEur', tooltipField: 'incomeEur', headerName: 'Income Eur', type:'abColDefNumber'},
      { field: 'capitalInvestedBase', tooltipField: 'capitalInvestedBase', headerName: 'Capital Invested Base', type:'abColDefNumber'},
      { field: 'capitalReturnBase', tooltipField: 'capitalReturnBase', headerName: 'Capital Return Base', type:'abColDefNumber'},
      { field: 'incomeBase', tooltipField: 'incomeBase', headerName: 'Income Base', type:'abColDefNumber'},
      { field: 'capitalInvested', tooltipField: 'capitalInvested', headerName: 'Capital Invested', type:'abColDefNumber'},
      { field: 'capitalReturn', tooltipField: 'capitalReturn', headerName: 'Capital Return', type:'abColDefNumber'},
      { field: 'income', tooltipField: 'income', headerName: 'Income', type:'abColDefNumber'},
      { field: 'isLevered', tooltipField: 'isLevered', headerName: 'Is Levered', type:'abColDefString'},
      { field: 'fxRateEurTradeDate', tooltipField: 'fxRateEurTradeDate', headerName: 'FX Rate Eur Trade Date', type:'abColDefNumber'},
      { field: 'fxRateBaseTradeDate', tooltipField: 'fxRateBaseTradeDate', headerName: 'FX Rate Base Trade Date', type:'abColDefNumber'},
      { field: 'extractId', tooltipField: 'extractId', headerName: 'Extract ID', type:'abColDefNumber'},
      { field: 'extractDatetime', tooltipField: 'extractDatetime', headerName: 'Extract Datetime', type:'abColDefDate', cellClass: 'dateUK'},
      { field: 'realisedEur', tooltipField: 'realisedEur', headerName: 'Realised Eur', type:'abColDefNumber'},
      { field: 'realisedInterestEur', tooltipField: 'realisedInterestEur', headerName: 'Realised Interest Eur', type:'abColDefNumber'},
      { field: 'realisedFeesEur', tooltipField: 'realisedFeesEur', headerName: 'Realised Fees Eur', type:'abColDefNumber'},
      { field: 'totalEurUnrealisedGain', tooltipField: 'totalEurUnrealisedGain', headerName: 'Total Eur Unrealised Gain', type:'abColDefNumber'},
      { field: 'totalEurNoInterest', tooltipField: 'totalEurNoInterest', headerName: 'Total Eur No Interest', type:'abColDefNumber'},
      { field: 'totalEurNoFees', tooltipField: 'totalEurNoFees', headerName: 'Total Eur No Fees', type:'abColDefNumber'}

    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      context:{},
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      columnDefs: this.columnDefs,
      allowContextMenuWithControlKey:false,
      suppressScrollOnNewData: true,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES, 
      noRowsOverlayComponent: NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
      rowHeight: 30,
      headerHeight: 30,
      groupHeaderHeight: 30,
      defaultColDef: {
        resizable: true,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        filter: true
      }
    }

    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Position Cashflows/Base',
      adaptableStateKey: `Position Cashflows/Base Key`,
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      quickSearchOptions: {
        clearQuickSearchOnStartUp: true
      },
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), //https://docs.adaptabletools.com/guide/version-15-upgrade-guide
        loadSharedEntities: loadSharedEntities.bind(this)
  
      },
      formatColumnOptions:{
        customDisplayFormatters: [
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',this.AMOUNT_COLUMNS)
          ],
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
          IsHidden: false,
          DashboardTitle: ' '
        },
        Layout: {
          Revision: 3,
          CurrentLayout: 'Default Cashflows/Base Layout',
          Layouts: [{
            Name: 'Default Cashflows/Base Layout',
            Columns: [
              'issuer',
              'assetName',
              'id',
              'portfolio',
              'portfolioType',
              'bookName',
              'entity',
              'cashDate',
              'baseGIR',
              'baseGIRAsOfDate',
              'baseGIRTradeDate',
              'baseGIRWtAvgCommited',
              'baseGIRWtAvgFunded',
              'eurGIR',
              'eurGIRAsOfDate',
              'eurGIRTradeDate',
              'eurGIRWtAvgCommited',
              'eurGIRWtAvgFunded',
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
              'realized',
              'isActual',
              'isVirtual',
              'isUnsettled',
              'isCurrent',
              'isExpected',
              'isWorst',
              'isExit',
              'isCustom',
              'isCashIRR',
              'isYTE',
              'isYTW',
              'feesCcy',
              'interestCcy',
              'repaymentCcy',
              'capitalInvestedCcy',
              'actualCashBalance',
              'eurBasisRate',
              'hedgeBasisRate',
              'hedgeFinancingRate',
              'eurFinancingRate',
              'effectiveTotalEur',
              'marketValueDaily',
              'marketValueDailyEur',
              'faceValue',
              'internalTradeTotal',
              'internalTradeTotalEur',
              'asOfDate',
              'currency',
              'feesEur',
              'capitalInvestedEur',
              'capitalReturnEur',
              'incomeEur',
              'capitalInvestedBase',
              'capitalReturnBase',
              'incomeBase',
              'capitalInvested',
              'capitalReturn',
              'income',
              'isLevered',
              'extractId',
              'extractDatetime',
              'realisedEur',
              'realisedInterestEur',
              'realisedFeesEur',
              'totalEurUnrealisedGain',
              'totalEurNoInterest',
              'totalEurNoFees'    
            ],
            RowGroupedColumns: [],
            ColumnWidthMap:{
              Edit: 50,
            },
            PinnedColumnsMap: {
              Edit: 'right',
            },
          }]
        },
        FormatColumn:{
          Revision:1,
          FormatColumns:[
             BLANK_DATETIME_FORMATTER_CONFIG(['asOfDate','cashDate','extractDatetime']),
             DATE_FORMATTER_CONFIG_ddMMyyyy(['asOfDate','cashDate']),
             DATETIME_FORMATTER_CONFIG_ddMMyyyy_HHmm(['extractDatetime']),
             CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,['amountFormatter']),
          ]
        },
        StatusBar: {
          Revision: 1,
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
}
