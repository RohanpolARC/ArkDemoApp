import { AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, GridApi, GridOptions, GridReadyEvent, Module, ExcelStyle } from '@ag-grid-community/all-modules';
import { ClipboardModule, ColumnsToolPanelModule, ExcelExportModule, FiltersToolPanelModule, MenuModule, RangeSelectionModule, SetFilterModule, SideBarModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { FeeCalculationService } from 'src/app/core/services/FeeCalculation/fee-calculation.service';
import { amountFormatter, dateFormatter } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-fee-calculation',
  templateUrl: './fee-calculation.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './fee-calculation.component.scss']
})

export class FeeCalculationComponent implements OnInit {

  subscriptions: Subscription[] = []
  columnDefsCFs: ColDef[]
  gridOptionsCFs: GridOptions
  adaptableOptionsCFs: AdaptableOptions
  closeTimer: Subject<any> = new Subject<any>();
  rowDataCFs: any[] = []    // Fee Cashflows
  rowDataSmy: any[] = []    // Output summary
  gridApiCFs: GridApi

  agGridModules: Module[] = [
    ClientSideRowModelModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    ClipboardModule,
    SideBarModule,
    RangeSelectionModule
  ];

  isFirstCallMade: boolean = false
  asOfDate: string; //'YYYY-MM-DD'
  entity: string

  constructor(
    private dataSvc: DataService,
    private feeCalcSvc: FeeCalculationService
  ) {
  }

  onGridCFsReady(params: GridReadyEvent){
    this.gridApiCFs = params.api
    this.gridApiCFs.closeToolPanel();

    this.subscriptions.push(this.feeCalcSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate
    }))

    this.subscriptions.push(this.feeCalcSvc.currententityValue.subscribe(entity => {
      this.entity = entity
    }))

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.fetchFeeCashflows();
      }
    }))
  }

  fetchFeeCashflows(){

    if(!this.asOfDate || !this.entity){
      console.warn(`Received something null -> AsOfDate: ${this.asOfDate} , Entity: ${this.entity}`)
      return;
    }

    this.rowDataSmy = null
    this.gridApiCFs.showLoadingOverlay();
    this.subscriptions.push(this.feeCalcSvc.getFeeCalculation({asOfDate: this.asOfDate, entity: this.entity}).subscribe({
    next: response => {

      timer(0, 10000).pipe(
        switchMap(() => this.feeCalcSvc.getFeeCalcStatus(response?.['statusQueryGetUri'])),
        takeUntil(this.closeTimer)
      ).subscribe({
        next: (res: any) => {

          if(res?.['runtimeStatus'] === 'Completed'){
            this.rowDataCFs = res?.['output']['FeeCashflows'][0]
            this.rowDataSmy = res?.['output']['FeeOutput']
            this.closeTimer.next();
            this.gridApiCFs.hideOverlay();

            
            this.gridOptionsCFs.columnApi?.autoSizeColumns(this.columnDefsCFs.map(colDef => colDef.field), false);
          }
          else if(res?.['runtimeStatus'] === 'Failed'){
            this.rowDataCFs = []
            this.rowDataSmy = []
            this.closeTimer.next();
            this.gridApiCFs.hideOverlay();
          }
        }
      })
    },
    error: error => {
      console.error(`Failed to make fee calculation request: ${error}`);
      this.rowDataCFs = []
      this.rowDataSmy = []
      this.gridApiCFs.hideOverlay();
    }
  
  }))

  }

  ngOnInit(): void {

    let excelStyles: ExcelStyle[] = [
      {
        id: 'dateUK',
        dataType: 'DateTime',
        numberFormat: {
          format: 'dd/mm/yy'
        }
      }
    ]

    let defaultColDef = {
      resizable: true,
      sortable: true,
      filter: true
    }

    this.columnDefsCFs = [
      { field: 'Date', tooltipField:  'Date', valueFormatter: dateFormatter, minWidth: 122, type: 'abColDefDate' },
      { field: 'NumberDays', tooltipField:  'NumberDays', type: 'abColDefNumber' },
      { field: 'Fund', tooltipField:  'Fund', type: 'abColDefString' },
      { field: 'CashType', tooltipField:  'CashType', type:'abColDefString' },
      { field: 'TotalType', tooltipField:  'TotalType', valueFormatter: amountFormatter, type: 'abColDefNumber' },
      { field: 'LocalLastMgmtFeeDate', tooltipField:  'LocalLastMgmtFeeDate', valueFormatter: dateFormatter, minWidth: 122, type: 'abColDefDate' },
      { field: 'LocalLastHurdleCompoundDate', tooltipField:  'LocalLastHurdleCompoundDate', valueFormatter: dateFormatter, minWidth: 122, type: 'abColDefDate' },
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

    this.gridOptionsCFs = {
      enableRangeSelection: true,
      columnDefs: this.columnDefsCFs,
      defaultColDef: defaultColDef,
      onGridReady: this.onGridCFsReady.bind(this),
      sideBar: true,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      }
    }

    this.adaptableOptionsCFs = {
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

  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}