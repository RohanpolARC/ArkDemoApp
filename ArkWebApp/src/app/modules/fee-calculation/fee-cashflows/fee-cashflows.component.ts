import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, Module, ValueFormatterParams } from '@ag-grid-community/core';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { amountFormatter, dateFormatter } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-fee-cashflows',
  templateUrl: './fee-cashflows.component.html',
  styleUrls: ['./fee-cashflows.component.scss']
})
export class FeeCashflowsComponent implements OnInit {

  @Input() feeCashflows;
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
      if(this.status === 'Loading')
        this.gridApi.showLoadingOverlay();
      else 
        this.gridApi.hideOverlay();
    }
  }

  ngOnInit(): void {
    
    this.columnDefs = [
      { field: 'Date', tooltipField:  'Date', valueFormatter: dateFormatter, cellClass: 'dateUK', minWidth: 122, type: 'abColDefDate' },
      { field: 'NumberDays', tooltipField:  'NumberDays', type: 'abColDefNumber' },
      { field: 'Fund', tooltipField:  'Fund', type: 'abColDefString' },
      { field: 'CashType', tooltipField:  'CashType', type:'abColDefString' },
      { field: 'TotalType', tooltipField:  'TotalType', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalLastMgmtFeeDate', tooltipField:  'LocalLastMgmtFeeDate', valueFormatter: dateFormatter, cellClass: 'dateUK', minWidth: 122, type: 'abColDefDate' },
      { field: 'LocalLastHurdleCompoundDate', tooltipField:  'LocalLastHurdleCompoundDate', valueFormatter: dateFormatter, cellClass: 'dateUK', minWidth: 122, type: 'abColDefDate' },
      { field: 'LocalHurdleCompoundingAdjustment', tooltipField:  'LocalHurdleCompoundingAdjustment', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'Total', tooltipField:  'Total', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalAfterOtherExpenses', tooltipField:  'TotalAfterOtherExpenses', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalAfterMgmtFee', tooltipField:  'TotalAfterMgmtFee', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalAfterPerfFee', tooltipField:  'TotalAfterPerfFee', valueFormatter: amountFormatter , type: 'abColDefNumber'},
      { field: 'TotalAfterFXHedging', tooltipField:  'TotalAfterFXHedging', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'Capital', tooltipField:  'Capital', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalAvgTimeWeightCumCapital', tooltipField:  'LocalAvgTimeWeightCumCapital', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalAvgTimeWeightCumCapitalHurdle', tooltipField:  'LocalAvgTimeWeightCumCapitalHurdle', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumCapital', tooltipField:  'LocalCumCapital', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumCapitalHurdle', tooltipField:  'LocalCumCapitalHurdle', valueFormatter: amountFormatter , type: 'abColDefNumber'},
      { field: 'LocalCompoundingAdjustment', tooltipField:  'LocalCompoundingAdjustment', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'Income', tooltipField:  'Income', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumIncome', tooltipField:  'LocalCumIncome', valueFormatter: amountFormatter , type: 'abColDefNumber'},
      { field: 'Interest', tooltipField:  'Interest', valueFormatter: amountFormatter , type: 'abColDefNumber'},
      { field: 'LocalCumInterest', tooltipField:  'LocalCumInterest', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'MgmtFees', tooltipField:  'MgmtFees', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumMgmtfees', tooltipField:  'LocalCumMgmtfees', valueFormatter: amountFormatter , type: 'abColDefNumber'},
      { field: 'PeriodPerfFees', tooltipField:  'PeriodPerfFees', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'PerfFees', tooltipField:  'PerfFees', valueFormatter: amountFormatter , type: 'abColDefNumber'},
      { field: 'OtherExpenses', tooltipField:  'OtherExpenses', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'SingleTranslationFX', tooltipField:  'SingleTranslationFX', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalTranslationFX', tooltipField:  'LocalTranslationFX', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumOtherExpenses', tooltipField:  'LocalCumOtherExpenses', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'PeriodHurdle', tooltipField:  'PeriodHurdle', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumHurdle', tooltipField:  'LocalCumHurdle', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalHurdle', tooltipField:  'TotalHurdle', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'NAV', tooltipField:  'NAV', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'GAV', tooltipField:  'GAV', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'NAVAboveHurdle', tooltipField:  'NAVAboveHurdle', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'NAVAboveHurdleActual', tooltipField:  'NAVAboveHurdleActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'MarketValue', tooltipField:  'MarketValue', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'Cost', tooltipField:  'Cost', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalPnL', tooltipField:  'TotalPnL', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'FundFlow', tooltipField:  'FundFlow', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'NetCashFlow', tooltipField:  'NetCashFlow', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'FXHedgeCost', tooltipField:  'FXHedgeCost', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumFXHedgeCost', tooltipField:  'LocalCumFXHedgeCost', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'MgmtFeesActual', tooltipField:  'MgmtFeesActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumMgmtFeesActual', tooltipField:  'LocalCumMgmtFeesActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'FXHedgeCostActual', tooltipField:  'FXHedgeCostActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumFXHedgeCostActual', tooltipField:  'LocalCumFXHedgeCostActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'PerfFeesActual', tooltipField:  'PerfFeesActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumPerfFeesActual', tooltipField:  'LocalCumPerfFeesActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'OtherExpensesActual', tooltipField:  'OtherExpensesActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumOtherExpensesActual', tooltipField:  'LocalCumOtherExpensesActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'FinancingCost', tooltipField:  'FinancingCost', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumFinancingCost', tooltipField:  'LocalCumFinancingCost', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'Financing', tooltipField:  'Financing', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalCumFinancing', tooltipField:  'LocalCumFinancing', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalAfterMgmtFeeActual', tooltipField:  'TotalAfterMgmtFeeActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalAfterPerfFeeActual', tooltipField:  'TotalAfterPerfFeeActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalAfterFXHedgingActual', tooltipField:  'TotalAfterFXHedgingActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalAfterOtherExpensesActual', tooltipField:  'TotalAfterOtherExpensesActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalAfterFinancingCostActual', tooltipField:  'TotalAfterFinancingCostActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'TotalAfterFinancingCost', tooltipField:  'TotalAfterFinancingCost', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'NAVActual', tooltipField:  'NAVActual', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'scale', tooltipField:  'scale', type: 'abColDefNumber' },
    ]

    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true
      },
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
      adaptableId: 'Fee Cashflows',
      adaptableStateKey: 'Fee Cashflows Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      predefinedConfig: {
        Dashboard: {
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
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
            Columns: this.columnDefs.map(def => def.field)
          }]
        }
      }
    }
  }
}
