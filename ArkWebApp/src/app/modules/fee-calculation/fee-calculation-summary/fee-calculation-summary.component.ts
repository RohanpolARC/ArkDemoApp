import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, Module, ValueFormatterParams, ValueGetterParams } from '@ag-grid-community/core';
import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { FeeCalculationService } from 'src/app/core/services/FeeCalculation/fee-calculation.service';
import { DataService } from 'src/app/core/services/data.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import {  BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER,   DATE_FORMATTER_CONFIG_ddMMyyyy } from 'src/app/shared/functions/formatter';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { dateNullValueGetter } from 'src/app/shared/functions/value-getters';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';

@Component({
  selector: 'app-fee-calculation-summary',
  templateUrl: './fee-calculation-summary.component.html',
  styleUrls: ['./fee-calculation-summary.component.scss']
})
export class FeeCalculationSummaryComponent implements OnInit {

  @Input() feeSmy;
  @Input() status: 'Loading' | 'Loaded' | 'Failed';
  
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  subscriptions: Subscription[] = []
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions
  columnDefs: ColDef[]
  defaultColDef: ColDef
  gridApi: GridApi

  
AMOUNT_COLUMNS=['FXHedgeCost',
'FXHedgeCostActual',
'MgmtFees',
'MgmtFeesActual',
'PerfFees',
'PerfFeesActual',
'OtherExpenses',
'OtherExpensesActual',
'FinancingCostActual',
'GrossPnL',
'NetPnL',
'NetPnLAfterPerfFees',
'Commitement',
'TotalCapitalCalled',
'TotalIncome',
'TotalInterest',
'TotalHurdle',
'NavAboveHurdle',
'ProjCapDeployed',
'ProjCapDeployedRepayement',
'ProjCapDeployedInterest',
'ReinvestCapDeployed',
'ReinvestCapDeployedRepayement',
'ReinvestCapDeployedInterest',
'FinancingCapDeployed',
'FinancingCapDeployedRepayement',
'FinancingCapDeployedInterest',
'FinancingDeployed',
'FinancingDeployedRepayement',
'FinancingDeployedInterest',
'TotalCapDeployed',
'Holdback',
'IRRAdjustment',
'TranslationFX']


PERCENT_COLUMNS=['GrossIRR',
'IRRAfterFXHedgeCost',
'IRRAfterFinancingCost',
'IRRAfterOtherExpenses',
'IRRAfterMgmtFees',
'IRRAfterPerfFees',
'GrossIRRLeveraged',
'IRRAfterFXHedgeCostLeveraged',
'IRRAfterFinancingCostLeveraged',
'IRRAfterOtherExpensesLeveraged',
'IRRAfterMgmtFeesLeveraged',
'IRRAfterPerfFeesLeveraged',
'IRRAfterFXHedgeCostActual',
'IRRAfterFinancingCostActual',
'IRRAfterOtherExpensesActual',
'IRRAfterMgmtFeesActual',
'IRRAfterPerfFeesActual',
'IRRAfterFinancingCostActualLeveraged',
'IRRAfterFXHedgeCostActualLeveraged',
'IRRAfterOtherExpensesActualLeveraged',
'IRRAfterMgmtFeesActualLeveraged',
'IRRAfterPerfFeesActualLeveraged',
'IRRAfterFinancingCostActualLeveragedAdjusted',
'IRRAfterOtherExpensesActualLeveragedAdjusted',
'IRRAfterMgmtFeesActualLeveragedAdjusted',
'IRRAfterPerfFeesActualLeveragedAdjusted',
'NetIRR',
'GrossIRRBeforePerformanceFees',
'GrossIRRBeforeManagementFees',
'GrossIRRBeforeExpenses',
'GrossIRRBeforeInterestExpense',
'GrossIRRBeforeFX',
'GrossIRRBeforeTranslation',
'GrossIRRBeforeLeverage',
'GrossIRRBeforePerformanceFeesActual',
'GrossIRRBeforeManagementFeesActual',
'GrossIRRBeforeExpensesActual',
'GrossIRRBeforeInterestExpenseActual',
'GrossIRRBeforeFXActual',
'GrossIRRBeforeTranslationActual',
'GrossIRRBeforeLeverageActual',
'CashYield',
'TotalYield',
'FinancingRate',
'MgmtFeesRate',
'OtherExpenseRate',
'UndrawnCommitFeesRate',
'PerfFeesRate',
'HurdleRate',
'CatchupRate']

DATE_COLUMNS = [
'AsofDate',
'FinancingStartDate',
'FinancingEndDate',
'FirstCashFlowDate',
'LastCashFlowDate']

NON_AMOUNT_2DEC_COLUMNS=['GrossMOM',
'MOMAfterFXHedgeCost',
'MOMAfterMgmtFees',
'MOMAfterPerfFees',
'InvestmentPeriod',
'HurdleCompoundingYears',
'FundInvestmentPeriod']

  noRowsToDisplayMsg: NoRowsCustomMessages = 'Please apply the filter.';

  constructor(
    private dataSvc: DataService,
    private feeCalcSvc: FeeCalculationService
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
      if(changes?.['status'].currentValue === 'Loading')
        this.gridApi?.showLoadingOverlay();
      else 
        if(this.feeSmy.length === 0){
          this.noRowsToDisplayMsg = 'No data found for applied filter.'
        }
        this.gridApi?.hideOverlay();
    }
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    adaptableApi.columnApi.autosizeAllColumns()

  }

  ngOnInit(): void {

    this.defaultColDef = {
      resizable: true,
      sortable: true,
      filter: true
    }

    this.columnDefs = [
    { field: 'FundName' },
    { field: 'ScenarioType' },
    { field: 'AsofDate', cellClass: 'dateUK',type:'abColDefDate'},
    { field: 'FXHedgeCost', type:'abColDefNumber'},
    { field: 'FXHedgeCostActual' , type:'abColDefNumber'},
    { field: 'MgmtFees' , type:'abColDefNumber'},
    { field: 'MgmtFeesActual' , type:'abColDefNumber'},
    { field: 'PerfFees' , type:'abColDefNumber'},
    { field: 'PerfFeesActual' , type:'abColDefNumber'},
    { field: 'OtherExpenses' , type:'abColDefNumber'},
    { field: 'OtherExpensesActual' , type:'abColDefNumber'},
    { field: 'FinancingCostActual' , type:'abColDefNumber'},
    { field: 'GrossPnL' , type:'abColDefNumber'},
    { field: 'NetPnL' , type:'abColDefNumber'},
    { field: 'NetPnLAfterPerfFees' , type:'abColDefNumber'},
    { field: 'GrossIRR', type:'abColDefNumber'},
    { field: 'IRRAfterFXHedgeCost', type:'abColDefNumber'},
    { field: 'IRRAfterFinancingCost', type:'abColDefNumber'},
    { field: 'IRRAfterOtherExpenses', type:'abColDefNumber'},
    { field: 'IRRAfterMgmtFees', type:'abColDefNumber'},
    { field: 'IRRAfterPerfFees', type:'abColDefNumber'},
    { field: 'GrossIRRLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterFXHedgeCostLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterFinancingCostLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterOtherExpensesLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterMgmtFeesLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterPerfFeesLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterFXHedgeCostActual', type:'abColDefNumber'},
    { field: 'IRRAfterFinancingCostActual', type:'abColDefNumber'},
    { field: 'IRRAfterOtherExpensesActual', type:'abColDefNumber'},
    { field: 'IRRAfterMgmtFeesActual', type:'abColDefNumber'},
    { field: 'IRRAfterPerfFeesActual', type:'abColDefNumber'},
    { field: 'IRRAfterFinancingCostActualLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterFXHedgeCostActualLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterOtherExpensesActualLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterMgmtFeesActualLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterPerfFeesActualLeveraged', type:'abColDefNumber'},
    { field: 'IRRAfterFinancingCostActualLeveragedAdjusted', type:'abColDefNumber'},
    { field: 'IRRAfterOtherExpensesActualLeveragedAdjusted', type:'abColDefNumber'},
    { field: 'IRRAfterMgmtFeesActualLeveragedAdjusted', type:'abColDefNumber'},
    { field: 'IRRAfterPerfFeesActualLeveragedAdjusted', type:'abColDefNumber'},
    { field: 'NetIRR', type:'abColDefNumber'},
    { field: 'GrossIRRBeforePerformanceFees', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeManagementFees', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeExpenses', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeInterestExpense', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeFX', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeTranslation', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeLeverage', type:'abColDefNumber'},
    { field: 'GrossIRRBeforePerformanceFeesActual', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeManagementFeesActual', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeExpensesActual', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeInterestExpenseActual', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeFXActual', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeTranslationActual', type:'abColDefNumber'},
    { field: 'GrossIRRBeforeLeverageActual', type:'abColDefNumber'},
    { field: 'Commitement' , type:'abColDefNumber'},
    { field: 'TotalCapitalCalled' , type:'abColDefNumber'},
    { field: 'TotalIncome' , type:'abColDefNumber'},
    { field: 'TotalInterest' , type:'abColDefNumber'},
    { field: 'TotalHurdle' , type:'abColDefNumber'},
    { field: 'NavAboveHurdle' , type:'abColDefNumber'},
    { field: 'GrossMOM' , type:'abColDefNumber'},
    { field: 'MOMAfterFXHedgeCost' , type:'abColDefNumber'},
    { field: 'MOMAfterMgmtFees' , type:'abColDefNumber'},
    { field: 'MOMAfterPerfFees' , type:'abColDefNumber'},
    { field: 'FinancingStartDate', 
    valueGetter:(params:ValueGetterParams)=>{
      return dateNullValueGetter(params,'FinancingStartDate')
    },
    cellClass: 'dateUK' , type:'abColDefDate'},
    { field: 'FinancingEndDate', 
    valueGetter:(params:ValueGetterParams)=>{
      return dateNullValueGetter(params,'FinancingEndDate')
    },cellClass: 'dateUK' , type:'abColDefDate'},
    { field: 'CashYield', type:'abColDefNumber'},
    { field: 'TotalYield', type:'abColDefNumber'},
    { field: 'FinancingRate', type:'abColDefNumber'},
    { field: 'InvestmentPeriod' , type:'abColDefNumber'},
    { field: 'FirstCashFlowDate', 
    valueGetter:(params:ValueGetterParams)=>{
      return dateNullValueGetter(params,'FirstCashFlowDate')
    },
    cellClass: 'dateUK' , type:'abColDefDate'},
    { field: 'LastCashFlowDate',
    valueGetter:(params:ValueGetterParams)=>{
      return dateNullValueGetter(params,'LastCashFlowDate')
    },
    cellClass: 'dateUK' , type:'abColDefDate'},
    { field: 'ProjCapDeployed' , type:'abColDefNumber'},
    { field: 'ProjCapDeployedRepayement' , type:'abColDefNumber'},
    { field: 'ProjCapDeployedInterest' , type:'abColDefNumber'},
    { field: 'ReinvestCapDeployed' , type:'abColDefNumber'},
    { field: 'ReinvestCapDeployedRepayement' , type:'abColDefNumber'},
    { field: 'ReinvestCapDeployedInterest' , type:'abColDefNumber'},
    { field: 'FinancingCapDeployed' , type:'abColDefNumber'},
    { field: 'FinancingCapDeployedRepayement' , type:'abColDefNumber'},
    { field: 'FinancingCapDeployedInterest' , type:'abColDefNumber'},
    { field: 'FinancingDeployed' , type:'abColDefNumber'},
    { field: 'FinancingDeployedRepayement' , type:'abColDefNumber'},
    { field: 'FinancingDeployedInterest' , type:'abColDefNumber'},
    { field: 'TotalCapDeployed' , type:'abColDefNumber'},
    { field: 'MgmtFeesRate', type:'abColDefNumber'},
    { field: 'OtherExpenseRate', type:'abColDefNumber'},
    { field: 'UndrawnCommitFeesRate', type:'abColDefNumber'},
    { field: 'PerfFeesRate', type:'abColDefNumber'},
    { field: 'HurdleRate', type:'abColDefNumber'},
    { field: 'HurdleCompoundingYears' , type:'abColDefNumber'},
    { field: 'HasCatchup' , type:'abColDefNumber'},
    { field: 'CatchupRate', type:'abColDefNumber'},
    { field: 'Holdback' , type:'abColDefNumber'},
    { field: 'FundInvestmentPeriod' , type:'abColDefNumber'},
    { field: 'OverrideExpected' , type:'abColDefNumber'},
    { field: 'IRRAdjustment' , type:'abColDefNumber'},
    { field: 'TranslationFX' , type:'abColDefNumber'}

    ]

    this.gridOptions = {
      ...CommonConfig.GRID_OPTIONS,
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel();
        this.gridApi = params.api;   
        this.feeCalcSvc.feeCalcSummaryGridApi = params.api
        if(this.status === 'Loading'){
          this.gridApi.showLoadingOverlay();
        }     
      },      
      rowHeight: 30,
      groupHeaderHeight: 30,
      headerHeight: 30,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      noRowsOverlayComponent : NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
      onFirstDataRendered:(event:FirstDataRenderedEvent)=>{
        autosizeColumnExceptResized(event)
      },
    }

    this.adaptableOptions = {
      ...CommonConfig.ADAPTABLE_OPTIONS,
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Fee Summary',
      adaptableStateKey: 'Fee Summary Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',[...this.AMOUNT_COLUMNS]),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('percentFormatter',[...this.PERCENT_COLUMNS]),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('nonAmountNumberFormatter2Dec',[...this.NON_AMOUNT_2DEC_COLUMNS])
        ]
      },
      predefinedConfig: {
        Dashboard: {
          Revision: 3,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name: 'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false,
          DashboardTitle: 'Fee Summary'
        },
        Layout:{
          CurrentLayout: 'Basic Fee Summary Layout',
          Layouts: [{
            Name: 'Basic Fee Summary Layout',
            Columns: this.columnDefs.map(def => def.field)
          }]
        },
        FormatColumn:{
          Revision:11,
          FormatColumns:[

            CUSTOM_FORMATTER([...this.AMOUNT_COLUMNS],['amountFormatter']),
            CUSTOM_FORMATTER([...this.PERCENT_COLUMNS],['percentFormatter']),
            CUSTOM_FORMATTER([...this.NON_AMOUNT_2DEC_COLUMNS],['nonAmountNumberFormatter2Dec']),
            BLANK_DATETIME_FORMATTER_CONFIG([...this.DATE_COLUMNS]),
            DATE_FORMATTER_CONFIG_ddMMyyyy([...this.DATE_COLUMNS])
          ]
        }
      }
    }
  }
}