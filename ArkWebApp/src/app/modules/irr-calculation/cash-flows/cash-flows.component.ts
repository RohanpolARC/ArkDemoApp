
import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions,GridApi, GridReadyEvent, IAggFuncParams, Module, ValueFormatterParams } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { CashFlowService } from 'src/app/core/services/CashFlows/cash-flow.service';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { dateFormatter } from 'src/app/shared/functions/formatter';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { CashFlowParams} from 'src/app/shared/models/IRRCalculationsModel';
import { LoadStatusType } from '../portfolio-modeller/portfolio-modeller.component';

@Component({
  selector: 'app-cash-flows',
  templateUrl: './cash-flows.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss','./cash-flows.component.scss']
})
export class CashFlowsComponent implements OnInit {

  @Input() calcParams: CashFlowParams;
  @Output() status = new EventEmitter<LoadStatusType>();
  
  subscriptions: Subscription[] = []
  columnDefs: ColDef[]
  gridOptions: GridOptions
  runID: string
  rowData: any

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  modelName: string
  baseMeasure: string
  asOfDate: string
  closeStream: Subject<any> = new Subject<any>();
  gridApi: GridApi;
  adaptableOptions: AdaptableOptions;
  adaptableApi: AdaptableApi;

  constructor(
    private cashFlowService:CashFlowService,
    public irrCalcSvc: IRRCalcService,
    private dataSvc: DataService  
  ) { }



  ngOnInit(): void {

    this.irrCalcSvc.cashflowLoadStatusEvent.subscribe({
      next:(e) => {
        if(e.status === 'Loaded'){
          this.status.emit('Loaded')
          this.closeStream.next();
          this.rowData = this.irrCalcSvc.loadedPositionCashflows;

          setTimeout(() => {
            this.gridOptions?.api?.setRowData(this.rowData)
            
            this.adaptableApi.dashboardApi.setDashboardTitle(`Cashflows (${this.rowData.length})`)
            this.adaptableApi.dashboardApi.refreshDashboard()
            
          }, 500);

         
        }
      },
      error:(error)=>{
        console.error(`Failed to get Cashflows : ${error}`)
        this.rowData=[]
        this.status.emit('Failed')
      }
    }
    )

    this.columnDefs = [
      // {field:'RunID',type:'abColDefString'},
      {field:'Issuer',type:'abColDefString'},
      {field:'AssetName',type:'abColDefString'},
      {field:'id',type:'abColDefNumber'},
      {field:'Portfolio',type:'abColDefString'},
      {field:'PortfolioType',type:'abColDefString'},
      {field:'BookName',type:'abColDefString'},
      {field:'Entity',type:'abColDefString'},
      {field:'CashDate',valueFormatter: dateFormatter, cellClass: 'dateUK', minWidth: 122, type: 'abColDefDate' },
      {field:'FXRate',type:'abColDefString'},
      {field:'FXRateCapital',type:'abColDefString'},
      {field:'FXRateIncome',type:'abColDefString'},
      {field:'FXRateMethod',type:'abColDefString'},
      {field:'FXRateBase',type:'abColDefString'},
      {field:'FXRateBaseCapital',type:'abColDefString'},
      {field:'FXRateBaseIncome',type:'abColDefString'},
      {field:'BaseGIR',type:'abColDefString'},
      {field:'BaseGIRAsOfDate',type:'abColDefString'},
      {field:'BaseGIRTradeDate',type:'abColDefString'},
      {field:'BaseGIRWtAvgCommited',type:'abColDefString'},
      {field:'BaseGIRWtAvgFunded',type:'abColDefString'},
      {field:'FXRateEur',type:'abColDefString'},
      {field:'FXRateEurCapital',type:'abColDefString'},
      {field:'FXRateEurIncome',type:'abColDefString'},
      {field:'EurGIR',type:'abColDefString'},
      {field:'EurGIRAsOfDate',type:'abColDefString'},
      {field:'EurGIRTradeDate',type:'abColDefString'},
      {field:'EurGIRWtAvgCommited',type:'abColDefString'},
      {field:'EurGIRWtAvgFunded',type:'abColDefString'},
      {field:'FXFWDRate',type:'abColDefString'},
      {field:'Principal',type:'abColDefString'},
      {field:'PrincipalIndexed',type:'abColDefString'},
      {field:'Pik',type:'abColDefString'},
      {field:'Repayment',type:'abColDefString'},
      {field:'FwdCurve',type:'abColDefString'},
      {field:'Interest',type:'abColDefString'},
      {field:'Fees',type:'abColDefString'},
      {field:'PikInterest',type:'abColDefString'},
      {field:'PurchaseDiscount',type:'abColDefString'},
      {field:'MarketValue',type:'abColDefString'},
      {field:'AccruedInterest',type:'abColDefString'},
      {field:'AccruedFees',type:'abColDefString'},
      {field:'TotalInterest',type:'abColDefString'},
      {field:'TotalIncome',type:'abColDefString'},
      {field:'Total',type:'abColDefString'},
      {field:'TotalEur',type:'abColDefString'},
      {field:'TotalBase',type:'abColDefString'},
      {field:'Realized',type:'abColDefString'},
      {field:'IsActual',type:'abColDefString'},
      {field:'IsVirtual',type:'abColDefString'},
      {field:'IsUnsettled',type:'abColDefString'},
      {field:'IsCurrent',type:'abColDefString'},
      {field:'IsExpected',type:'abColDefString'},
      {field:'IsWorst',type:'abColDefString'},
      {field:'IsExit',type:'abColDefString'},
      {field:'IsCustom',type:'abColDefString'},
      {field:'IsCashIRR',type:'abColDefString'},
      {field:'IsYTE',type:'abColDefString'},
      {field:'IsYTW',type:'abColDefString'},
      {field:'FeesCcy',type:'abColDefString'},
      {field:'InterestCcy',type:'abColDefString'},
      {field:'RepaymentCcy',type:'abColDefString'},
      {field:'CapitalInvestedCcy',type:'abColDefString'},
      {field:'ActualFXRate',type:'abColDefString'},
      {field:'FXHedgeCost',type:'abColDefString'},
      {field:'FXBasisCost',type:'abColDefString'},
      {field:'ActualCashBalance',type:'abColDefString'},
      {field:'EURBasisRate',type:'abColDefString'},
      {field:'HedgeBasisRate',type:'abColDefString'},
      {field:'HedgeFinancingRate',type:'abColDefString'},
      {field:'EURFinancingRate',type:'abColDefString'},
      {field:'EffectiveFXRate',type:'abColDefString'},
      {field:'EffectiveTotalEur',type:'abColDefString'},
      {field:'TranslationFX',type:'abColDefString'},
      {field:'MarketValueDaily',type:'abColDefString'},
      {field:'MarketValueDailyEur',type:'abColDefString'},
      {field:'FaceValue',type:'abColDefString'},
      {field:'useBaseFXRate',type:'abColDefString'},
      {field:'InternalTradeTotal',type:'abColDefString'},
      {field:'InternalTradeTotalEur',type:'abColDefString'},
      // {field:'AsOfDate',type:'abColDefString'},
      // {field:'ExtractDatetime',type:'abColDefString', valueFormatter: dateFormatter},
      {field:'Currency',type:'abColDefString'}
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
  ngOnChanges(changes: SimpleChanges){


    if(this.calcParams !== null){
      this.runID = this.calcParams.runID;
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}

