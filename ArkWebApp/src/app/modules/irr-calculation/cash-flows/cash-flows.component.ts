
import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions,GridApi, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { CashFlowService } from 'src/app/core/services/CashFlows/cash-flow.service';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, dateFormatter } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
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
      { field: 'portfolioType', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'bookName', type: 'abColDefString' },
      { field: 'entity', type: 'abColDefString'},
      { field: 'cashDate', valueFormatter:  dateFormatter,  cellClass: 'dateUK', minWidth: 122, type: 'abColDefDate' },
      { field: 'fxRate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxRateCapital', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxRateIncome', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxRateMethod', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxRateBase', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxRateBaseCapital', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxRateBaseIncome', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'baseGIR', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'baseGIRAsOfDate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'baseGIRTradeDate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'baseGIRWtAvgCommited', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'baseGIRWtAvgFunded', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxRateEur', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxRateEurCapital', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxRateEurIncome', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'eurGIR', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'eurGIRAsOfDate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'eurGIRTradeDate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'eurGIRWtAvgCommited', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'eurGIRWtAvgFunded', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxFWDRate', type: 'abColDefNumber', valueFormatter: amountFormatter, headerName: 'FX Forward Rate' },
      { field: 'principal', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'principalIndexed', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'pik', type: 'abColDefNumber', valueFormatter: amountFormatter, headerName: 'PIK' },
      { field: 'repayment', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fwdCurve', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'interest', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fees', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'pikInterest', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'purchaseDiscount', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'marketValue', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'accruedInterest', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'accruedFees', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'totalInterest', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'totalIncome', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'total', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'totalEur', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'totalBase', type: 'abColDefNumber', valueFormatter: amountFormatter },
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
      { field: 'feesCcy', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'interestCcy', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'repaymentCcy', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'capitalInvestedCcy', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'actualFXRate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxHedgeCost', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'fxBasisCost', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'actualCashBalance', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'eurBasisRate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'hedgeBasisRate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'hedgeFinancingRate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'eurFinancingRate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'effectiveFXRate', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'effectiveTotalEur', type: 'abColDefNumber', valueFormatter: amountFormatter },
      { field: 'translationFX', type: 'abColDefString' },
      { field: 'marketValueDaily', type: 'abColDefString' },
      { field: 'marketValueDailyEur', type: 'abColDefString' },
      { field: 'faceValue', type: 'abColDefString' },
      { field: 'useBaseFXRate', type: 'abColDefString' },
      { field: 'internalTradeTotal', type: 'abColDefString' },
      { field: 'internalTradeTotalEur', type: 'abColDefString' },
      { field: 'currency', type: 'abColDefString' }
    ]

    this.gridOptions = {
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
      }
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
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      

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
          Revision: 2,
          Layouts: [{
            Name: 'Basic Cashflows Layout',
            Columns: this.columnDefs.map(def => def.field)
          }]
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

