import { AdaptableOptions, AdaptableToolPanelAgGridComponent } from "@adaptabletools/adaptable-angular-aggrid";
import { ColDef, GridOptions } from "@ag-grid-community/all-modules";
import { DataService } from "src/app/core/services/data.service";
import { amountFormatter, dateFormatter } from "src/app/shared/functions/formatter";
import { getSharedEntities, setSharedEntities } from "src/app/shared/functions/utilities";

export class FeeCalculationGridConfig {

    constructor(dataSvc: DataService) {}

    columnDefsCFs: ColDef[] = [
        { field: 'Date', tooltipField:  'Date', valueFormatter: dateFormatter, minWidth: 122, cellClass: 'dateUK' },
        { field: 'NumberDays', tooltipField:  'NumberDays' },
        { field: 'Fund', tooltipField:  'Fund' },
        { field: 'CashType', tooltipField:  'CashType' },
        { field: 'TotalType', tooltipField:  'TotalType', valueFormatter: amountFormatter },
        { field: 'LocalLastMgmtFeeDate', tooltipField:  'LocalLastMgmtFeeDate', valueFormatter: dateFormatter, minWidth: 122 },
        { field: 'LocalLastHurdleCompoundDate', tooltipField:  'LocalLastHurdleCompoundDate', valueFormatter: dateFormatter, minWidth: 122 },
        { field: 'LocalHurdleCompoundingAdjustment', tooltipField:  'LocalHurdleCompoundingAdjustment', valueFormatter: amountFormatter },
        { field: 'Total', tooltipField:  'Total', valueFormatter: amountFormatter },
        { field: 'TotalAfterOtherExpenses', tooltipField:  'TotalAfterOtherExpenses', valueFormatter: amountFormatter },
        { field: 'TotalAfterMgmtFee', tooltipField:  'TotalAfterMgmtFee', valueFormatter: amountFormatter },
        { field: 'TotalAfterPerfFee', tooltipField:  'TotalAfterPerfFee', valueFormatter: amountFormatter },
        { field: 'TotalAfterFXHedging', tooltipField:  'TotalAfterFXHedging', valueFormatter: amountFormatter },
        { field: 'Capital', tooltipField:  'Capital', valueFormatter: amountFormatter },
        { field: 'LocalAvgTimeWeightCumCapital', tooltipField:  'LocalAvgTimeWeightCumCapital', valueFormatter: amountFormatter },
        { field: 'LocalAvgTimeWeightCumCapitalHurdle', tooltipField:  'LocalAvgTimeWeightCumCapitalHurdle', valueFormatter: amountFormatter },
        { field: 'LocalCumCapital', tooltipField:  'LocalCumCapital', valueFormatter: amountFormatter },
        { field: 'LocalCumCapitalHurdle', tooltipField:  'LocalCumCapitalHurdle', valueFormatter: amountFormatter },
        { field: 'LocalCompoundingAdjustment', tooltipField:  'LocalCompoundingAdjustment', valueFormatter: amountFormatter },
        { field: 'Income', tooltipField:  'Income', valueFormatter: amountFormatter },
        { field: 'LocalCumIncome', tooltipField:  'LocalCumIncome', valueFormatter: amountFormatter },
        { field: 'Interest', tooltipField:  'Interest', valueFormatter: amountFormatter },
        { field: 'LocalCumInterest', tooltipField:  'LocalCumInterest', valueFormatter: amountFormatter },
        { field: 'MgmtFees', tooltipField:  'MgmtFees', valueFormatter: amountFormatter },
        { field: 'LocalCumMgmtfees', tooltipField:  'LocalCumMgmtfees', valueFormatter: amountFormatter },
        { field: 'PeriodPerfFees', tooltipField:  'PeriodPerfFees', valueFormatter: amountFormatter },
        { field: 'PerfFees', tooltipField:  'PerfFees', valueFormatter: amountFormatter },
        { field: 'OtherExpenses', tooltipField:  'OtherExpenses', valueFormatter: amountFormatter },
        { field: 'SingleTranslationFX', tooltipField:  'SingleTranslationFX', valueFormatter: amountFormatter },
        { field: 'LocalTranslationFX', tooltipField:  'LocalTranslationFX', valueFormatter: amountFormatter },
        { field: 'LocalCumOtherExpenses', tooltipField:  'LocalCumOtherExpenses', valueFormatter: amountFormatter },
        { field: 'PeriodHurdle', tooltipField:  'PeriodHurdle', valueFormatter: amountFormatter },
        { field: 'LocalCumHurdle', tooltipField:  'LocalCumHurdle', valueFormatter: amountFormatter },
        { field: 'TotalHurdle', tooltipField:  'TotalHurdle', valueFormatter: amountFormatter },
        { field: 'NAV', tooltipField:  'NAV', valueFormatter: amountFormatter },
        { field: 'GAV', tooltipField:  'GAV', valueFormatter: amountFormatter },
        { field: 'NAVAboveHurdle', tooltipField:  'NAVAboveHurdle', valueFormatter: amountFormatter },
        { field: 'NAVAboveHurdleActual', tooltipField:  'NAVAboveHurdleActual', valueFormatter: amountFormatter },
        { field: 'MarketValue', tooltipField:  'MarketValue', valueFormatter: amountFormatter },
        { field: 'Cost', tooltipField:  'Cost', valueFormatter: amountFormatter },
        { field: 'TotalPnL', tooltipField:  'TotalPnL', valueFormatter: amountFormatter },
        { field: 'FundFlow', tooltipField:  'FundFlow', valueFormatter: amountFormatter },
        { field: 'NetCashFlow', tooltipField:  'NetCashFlow', valueFormatter: amountFormatter },
        { field: 'FXHedgeCost', tooltipField:  'FXHedgeCost', valueFormatter: amountFormatter },
        { field: 'LocalCumFXHedgeCost', tooltipField:  'LocalCumFXHedgeCost', valueFormatter: amountFormatter },
        { field: 'MgmtFeesActual', tooltipField:  'MgmtFeesActual', valueFormatter: amountFormatter },
        { field: 'LocalCumMgmtFeesActual', tooltipField:  'LocalCumMgmtFeesActual', valueFormatter: amountFormatter },
        { field: 'FXHedgeCostActual', tooltipField:  'FXHedgeCostActual', valueFormatter: amountFormatter },
        { field: 'LocalCumFXHedgeCostActual', tooltipField:  'LocalCumFXHedgeCostActual', valueFormatter: amountFormatter },
        { field: 'PerfFeesActual', tooltipField:  'PerfFeesActual', valueFormatter: amountFormatter },
        { field: 'LocalCumPerfFeesActual', tooltipField:  'LocalCumPerfFeesActual', valueFormatter: amountFormatter },
        { field: 'OtherExpensesActual', tooltipField:  'OtherExpensesActual', valueFormatter: amountFormatter },
        { field: 'LocalCumOtherExpensesActual', tooltipField:  'LocalCumOtherExpensesActual', valueFormatter: amountFormatter },
        { field: 'FinancingCost', tooltipField:  'FinancingCost', valueFormatter: amountFormatter },
        { field: 'LocalCumFinancingCost', tooltipField:  'LocalCumFinancingCost', valueFormatter: amountFormatter },
        { field: 'Financing', tooltipField:  'Financing', valueFormatter: amountFormatter },
        { field: 'LocalCumFinancing', tooltipField:  'LocalCumFinancing', valueFormatter: amountFormatter },
        { field: 'TotalAfterMgmtFeeActual', tooltipField:  'TotalAfterMgmtFeeActual', valueFormatter: amountFormatter },
        { field: 'TotalAfterPerfFeeActual', tooltipField:  'TotalAfterPerfFeeActual', valueFormatter: amountFormatter },
        { field: 'TotalAfterFXHedgingActual', tooltipField:  'TotalAfterFXHedgingActual', valueFormatter: amountFormatter },
        { field: 'TotalAfterOtherExpensesActual', tooltipField:  'TotalAfterOtherExpensesActual', valueFormatter: amountFormatter },
        { field: 'TotalAfterFinancingCostActual', tooltipField:  'TotalAfterFinancingCostActual', valueFormatter: amountFormatter },
        { field: 'TotalAfterFinancingCost', tooltipField:  'TotalAfterFinancingCost', valueFormatter: amountFormatter },
        { field: 'NAVActual', tooltipField:  'NAVActual', valueFormatter: amountFormatter },
        { field: 'scale', tooltipField:  'scale' },
    ]

    columnDefsSmy: ColDef[] = [

    ]

    defaultColDef = {
        resizable: true,
        sortable: true,
        filter: true
    }

    gridOptionsCFs: GridOptions = {
        enableRangeSelection: true,
        columnDefs: this.columnDefsCFs,
        defaultColDef: this.defaultColDef,
        // onGridReady: this.onGridCFsReady.bind(this),
        sideBar: true,
        components: {
          AdaptableToolPanel: AdaptableToolPanelAgGridComponent
        },
        // excelStyles: excelStyles
      }
    gridOptionsSmy: GridOptions
    adaptableOptionsCFs: AdaptableOptions = {
        autogeneratePrimaryKey: true,
        primaryKey: '',
        userName: this.dataSvc.getCurrentUserName(),
        adaptableId: 'Fee Cashflows',
        adaptableStateKey: 'Fee Cashflows Key',
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
          Layout:{
            CurrentLayout: 'Basic Fee Cashflow Layout',
            Layouts: [{
              Name: 'Basic Fee Cashflow Layout',
              Columns: [
                'Date',
                'NumberDays',
                'Fund',
                'CashType',
                'TotalType',
                'LocalLastMgmtFeeDate',
                'LocalLastHurdleCompoundDate',
                'LocalHurdleCompoundingAdjustment',
                'Total',
                'TotalAfterOtherExpenses',
                'TotalAfterMgmtFee',
                'TotalAfterPerfFee',
                'TotalAfterFXHedging',
                'Capital',
                'LocalAvgTimeWeightCumCapital',
                'LocalAvgTimeWeightCumCapitalHurdle',
                'LocalCumCapital',
                'LocalCumCapitalHurdle',
                'LocalCompoundingAdjustment',
                'Income',
                'LocalCumIncome',
                'Interest',
                'LocalCumInterest',
                'MgmtFees',
                'LocalCumMgmtfees',
                'PeriodPerfFees',
                'PerfFees',
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
                'NAVAboveHurdleActual',
                'MarketValue',
                'Cost',
                'TotalPnL',
                'FundFlow',
                'NetCashFlow',
                'FXHedgeCost',
                'LocalCumFXHedgeCost',
                'MgmtFeesActual',
                'LocalCumMgmtFeesActual',
                'FXHedgeCostActual',
                'LocalCumFXHedgeCostActual',
                'PerfFeesActual',
                'LocalCumPerfFeesActual',
                'OtherExpensesActual',
                'LocalCumOtherExpensesActual',
                'FinancingCost',
                'LocalCumFinancingCost',
                'Financing',
                'LocalCumFinancing',
                'TotalAfterMgmtFeeActual',
                'TotalAfterPerfFeeActual',
                'TotalAfterFXHedgingActual',
                'TotalAfterOtherExpensesActual',
                'TotalAfterFinancingCostActual',
                'TotalAfterFinancingCost',
                'NAVActual',
                'scale'
              ]
            }]
          }
        }
    }

    adaptableOptionsSmy: AdaptableOptions
}

let gridOptionsCFs: GridOptions
let gridOptionsSmy: GridOptions
let adaptableOptionsCFs: AdaptableOptions
let adaptableOptionsSmy: AdaptableOptions

