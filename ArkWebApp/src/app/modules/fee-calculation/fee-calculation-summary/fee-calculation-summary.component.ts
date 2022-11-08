import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, Module, ValueFormatterParams } from '@ag-grid-community/core';
import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { amountFormatter, dateFormatter, nonAmountNumberFormatter2Dec } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';

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

  constructor(private dataSvc: DataService) { }

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
        this.gridApi.showLoadingOverlay();
      else 
        this.gridApi.hideOverlay();
    }
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
    { field: 'AsofDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'FXHedgeCost', valueFormatter: amountFormatter },
    { field: 'FXHedgeCostActual', valueFormatter: amountFormatter },
    { field: 'MgmtFees', valueFormatter: amountFormatter },
    { field: 'MgmtFeesActual', valueFormatter: amountFormatter },
    { field: 'PerfFees', valueFormatter: amountFormatter },
    { field: 'PerfFeesActual', valueFormatter: amountFormatter },
    { field: 'OtherExpenses', valueFormatter: amountFormatter },
    { field: 'OtherExpensesActual', valueFormatter: amountFormatter },
    { field: 'FinancingCostActual', valueFormatter: amountFormatter },
    { field: 'GrossPnL', valueFormatter: amountFormatter },
    { field: 'NetPnL', valueFormatter: amountFormatter },
    { field: 'NetPnLAfterPerfFees', valueFormatter: amountFormatter },
    { field: 'GrossIRR', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterFXHedgeCost', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterFinancingCost', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterOtherExpenses', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterMgmtFees', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterPerfFees', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterFXHedgeCostLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterFinancingCostLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterOtherExpensesLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterMgmtFeesLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterPerfFeesLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterFXHedgeCostActual', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterFinancingCostActual', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterOtherExpensesActual', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterMgmtFeesActual', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterPerfFeesActual', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterFinancingCostActualLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterFXHedgeCostActualLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterOtherExpensesActualLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterMgmtFeesActualLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterPerfFeesActualLeveraged', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterFinancingCostActualLeveragedAdjusted', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterOtherExpensesActualLeveragedAdjusted', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterMgmtFeesActualLeveragedAdjusted', valueFormatter: this.percentFormatter },
    { field: 'IRRAfterPerfFeesActualLeveragedAdjusted', valueFormatter: this.percentFormatter },
    { field: 'NetIRR', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforePerformanceFees', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeManagementFees', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeExpenses', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeInterestExpense', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeFX', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeTranslation', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeLeverage', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforePerformanceFeesActual', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeManagementFeesActual', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeExpensesActual', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeInterestExpenseActual', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeFXActual', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeTranslationActual', valueFormatter: this.percentFormatter },
    { field: 'GrossIRRBeforeLeverageActual', valueFormatter: this.percentFormatter },
    { field: 'Commitement', valueFormatter: amountFormatter },
    { field: 'TotalCapitalCalled', valueFormatter: amountFormatter },
    { field: 'TotalIncome', valueFormatter: amountFormatter },
    { field: 'TotalInterest', valueFormatter: amountFormatter },
    { field: 'TotalHurdle', valueFormatter: amountFormatter },
    { field: 'NavAboveHurdle', valueFormatter: amountFormatter },
    { field: 'GrossMOM', valueFormatter: nonAmountNumberFormatter2Dec },
    { field: 'MOMAfterFXHedgeCost', valueFormatter: nonAmountNumberFormatter2Dec },
    { field: 'MOMAfterMgmtFees', valueFormatter: nonAmountNumberFormatter2Dec },
    { field: 'MOMAfterPerfFees', valueFormatter: nonAmountNumberFormatter2Dec },
    { field: 'FinancingStartDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'FinancingEndDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'CashYield', valueFormatter: this.percentFormatter },
    { field: 'TotalYield', valueFormatter: this.percentFormatter },
    { field: 'FinancingRate', valueFormatter: this.percentFormatter },
    { field: 'InvestmentPeriod', valueFormatter: nonAmountNumberFormatter2Dec },
    { field: 'FirstCashFlowDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'LastCashFlowDate', valueFormatter: dateFormatter, cellClass: 'dateUK' },
    { field: 'ProjCapDeployed', valueFormatter: amountFormatter },
    { field: 'ProjCapDeployedRepayement', valueFormatter: amountFormatter },
    { field: 'ProjCapDeployedInterest', valueFormatter: amountFormatter },
    { field: 'ReinvestCapDeployed', valueFormatter: amountFormatter },
    { field: 'ReinvestCapDeployedRepayement', valueFormatter: amountFormatter },
    { field: 'ReinvestCapDeployedInterest', valueFormatter: amountFormatter },
    { field: 'FinancingCapDeployed', valueFormatter: amountFormatter },
    { field: 'FinancingCapDeployedRepayement', valueFormatter: amountFormatter },
    { field: 'FinancingCapDeployedInterest', valueFormatter: amountFormatter },
    { field: 'FinancingDeployed', valueFormatter: amountFormatter },
    { field: 'FinancingDeployedRepayement', valueFormatter: amountFormatter },
    { field: 'FinancingDeployedInterest', valueFormatter: amountFormatter },
    { field: 'TotalCapDeployed', valueFormatter: amountFormatter },
    { field: 'MgmtFeesRate', valueFormatter: this.percentFormatter },
    { field: 'OtherExpenseRate', valueFormatter: this.percentFormatter },
    { field: 'UndrawnCommitFeesRate', valueFormatter: this.percentFormatter },
    { field: 'PerfFeesRate', valueFormatter: this.percentFormatter },
    { field: 'HurdleRate', valueFormatter: this.percentFormatter },
    { field: 'HurdleCompoundingYears', valueFormatter: nonAmountNumberFormatter2Dec },
    { field: 'HasCatchup' },
    { field: 'CatchupRate', valueFormatter: this.percentFormatter },
    { field: 'Holdback' },
    { field: 'FundInvestmentPeriod', valueFormatter: nonAmountNumberFormatter2Dec },
    { field: 'OverrideExpected' },
    { field: 'IRRAdjustment' },
    { field: 'TranslationFX' }

    ]

    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel();
        this.gridApi = params.api;   
        if(this.status === 'Loading'){
          this.gridApi.showLoadingOverlay();
        }     
      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES
    }

    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      autogeneratePrimaryKey: true,
      primaryKey: '',
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Fee Summary',
      adaptableStateKey: 'Fee Summary Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

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
        }
      }
    }
  }
}