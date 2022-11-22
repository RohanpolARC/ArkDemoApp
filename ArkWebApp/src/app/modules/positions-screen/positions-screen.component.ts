import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, GridReadyEvent, Module, GridApi } from '@ag-grid-community/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { PositionScreenService } from 'src/app/core/services/PositionsScreen/positions-screen.service';
import { getSharedEntities, setSharedEntities } from 'src/app/shared/functions/utilities';
import { amountFormatter, dateFormatter, noDecimalAmountFormatter, nonAmountNumberFormatter2Dec } from 'src/app/shared/functions/formatter';



@Component({
  selector: 'app-positions-screen',
  templateUrl: './positions-screen.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./positions-screen.component.scss']
})
export class PositionsScreenComponent implements OnInit {

  subscriptions: Subscription[] = []
  gridOptions: GridOptions
  rowData:any = []
  adaptableOptions: AdaptableOptions
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  columnDefs: ColDef[]
  gridApi: GridApi;
  adaptableApi: AdaptableApi;
  asOfDate: string


  constructor(
    private dataSvc: DataService,
    public positionScreenSvc: PositionScreenService
  ) { }

  getPositionsData(){
    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.gridApi.showLoadingOverlay();
        this.positionScreenSvc.currentSearchDate.subscribe(asOfDate => {
          this.asOfDate = asOfDate
        })
    
        this.positionScreenSvc.getPositions(this.asOfDate).subscribe({
          next: (d) => {
            this.gridApi?.hideOverlay();
            this.rowData = d;
          },
          error: (e) => {
            console.error(`Failed to get the Positions: ${e}`)
          }
        })
    
      }
    }))
  }

  ngOnInit(): void {

    

    // this.subscriptions.push(this.positionScreenSvc.currentSearchDate.subscribe(asOfDate => {
    //   this.asOfDate = asOfDate
    // }))

    // this.subscriptions.push(this.positionScreenSvc.getPositions(this.asOfDate).subscribe({
    //   next: (d) => {
    //     this.gridApi?.hideOverlay();

    //     this.rowData = d;
    //   },
    //   error: (e) => {
    //     console.error(`Failed to get the Positions: ${e}`)
    //   }
    // }))
    
    this.columnDefs = [
      
      {field:'issuer',type:'abColDefString'}, 
      {field:'issuerShortName',type:'abColDefString'},
      {field:'asset',type:'abColDefString'},
      // {field:'fund',type:'abColDefString'},
      // {field:'fundAdmin',type:'abColDefString'},
      {field:'fundLegalEntity',type:'abColDefString'},
      {field:'fundHedging',type:'abColDefString'},
      {field:'fundStrategy',type:'abColDefString'},
      {field:'portfolioName',type:'abColDefString'},
      {field:'ccyName',type:'abColDefString'},
      {field:'faceValue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'faceValueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'faceValueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'costValue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'costValueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'costValueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'marketValue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'marketValueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'marketValueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'faceValueIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'faceValueIssueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'faceValueIssueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'costValueIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'costValueIssueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'costValueIssueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'marketValueIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'marketValueIssueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'marketValueIssueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'cost',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'mark',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'accInterestIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'accFeesIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'benchmarkIndex',type:'abColDefString'},
      {field:'spread',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'spreadFrequency',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'assetId',type:'abColDefNumber'},
      {field:'pikMargin',headerName:'PIK Margin',type:'abColDefNumber'},
      {field:'unfundedMargin',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'maturityDate',valueFormatter:  dateFormatter,cellClass:'dateUK',type: 'abColDefDate' },
      {field:'primaryId',type:'abColDefNumber' },
      {field:'assetTypeName',type:'abColDefString'},
      {field:'isMultiCurrency',type:'abColDefBoolean'},
      {field:'positionId',type:'abColDefNumber' },
      {field:'fxRateEur',headerName:'FX Rate EUR',type:'abColDefNumber',valueFormatter:nonAmountNumberFormatter2Dec},
      {field:'fxRateBase',headerName:'FX Rate Base',type:'abColDefNumber',valueFormatter:nonAmountNumberFormatter2Dec},
      {field:'feesIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'fees',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'feesFX',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'interestIncomeIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'interestIncome',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'interestIncomeFX',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'interestExpenseIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'interestExpense',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'interestExpenseFX',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'realizedPnLIssue',headerName:'Realized PnL Issue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'realizedPnL',headerName:'Realized PnL',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'realizedPnLFX',headerName:'Realized PnL FX',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'unrealizedPnLIssue',headerName:'Unrealized PnL Issue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'unrealizedPnL',headerName:'Unrealized PnL',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'unrealizedPnLFX',headerName:'Unrealized PnL FX',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'totalPnLIssue',headerName:'Total PnL Issue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'totalPnL',headerName:'Total PnL',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'totalPnLFX',headerName:'Total PnL FX',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'contractBaseRate',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'contractSpread',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'contractAllinRate',type:'abColDefNumber', valueFormatter: amountFormatter },
      // {field:'contractType',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'dirtyMarketValueIssue',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'dirtyMarketValueIssueFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'dirtyMarketValueIssueFundedSD',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'asOfDate',valueFormatter:  dateFormatter,cellClass:'dateUK',type: 'abColDefDate' },
      // {field:'issuerId',type:'abColDefNumber'},
      // {field:'faceValueGIR',type:'abColDefNumber', valueFormatter: amountFormatter },
      // {field:'faceValueGIRFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
      // {field:'costValueGIR',type:'abColDefNumber', valueFormatter: amountFormatter },
      // {field:'costValueGIRFunded',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'quantity',type:'abColDefNumber', valueFormatter: amountFormatter },
      // {field:'fundRecon',type:'abColDefString'},
      {field:'capitalisedInterestBase',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'capitalisedInterestEur',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'capitalisedInterestLocal',type:'abColDefNumber', valueFormatter: amountFormatter },
      {field:'status',type:'abColDefString'},
      // {field:'isFinancing',type:'abColDefBoolean'},
      {field:'settleType',type:'abColDefString'},
      // {field:'globalIssueAmount',type:'abColDefNumber', valueFormatter: amountFormatter },
      // {field:'m_lPortfolioType',headerName:'Portfolio Type',type:'abColDefNumber', valueFormatter: amountFormatter },
      // {field:'rCFType',headerName:'RCF Type',type:'abColDefNumber', valueFormatter: amountFormatter }
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
      adaptableId: 'Positions',
      adaptableStateKey: 'Positions Key',
      teamSharingOptions: {
        enableTeamSharing: true,
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)
      },
      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,
      

      predefinedConfig: {
        Dashboard: {
          Revision:9,
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
          CurrentLayout: 'Basic Positions Layout',
          Revision: 14,
          Layouts: [{
            Name: 'Basic Positions Layout',
            Columns: this.columnDefs.map(def => def.field)
          }]
        }
      }
    }

  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    //this.gridApi?.showLoadingOverlay();
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.getPositionsData();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>sub.unsubscribe());
  }

}
