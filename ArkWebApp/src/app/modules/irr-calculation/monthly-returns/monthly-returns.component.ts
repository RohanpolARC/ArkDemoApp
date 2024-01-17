import { AdaptableAngularAgGridModule, AdaptableApi, AdaptableModule, AdaptableOptions, CustomDisplayFormatterContext, EntitlementContext } from '@adaptabletools/adaptable-angular-aggrid';
import { BodyScrollEvent,ColDef,ColumnResizedEvent, GridOptions, GridApi, GridReadyEvent, IAggFuncParams, Module, ProcessCellForExportParams, RowNode, ValueFormatterParams, VirtualColumnsChangedEvent, FirstDataRenderedEvent } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { DataService } from 'src/app/core/services/data.service';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { MonthlyReturnsService } from 'src/app/core/services/MonthlyReturns/monthly-returns.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { BLANK_DATETIME_FORMATTER_CONFIG, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, DATE_FORMATTER_CONFIG_MMMyy} from 'src/app/shared/functions/formatter';
import { amountFormatter } from 'src/app/shared/functions/formatter';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { LoadStatus, MonthlyReturnsCalcParams, ParentTabType } from 'src/app/shared/models/IRRCalculationsModel';
import { getNodes } from '../../capital-activity/utilities/functions';
import { AgGridScrollService } from '../service/aggrid-scroll.service';
import { autosizeColumnExceptResized, getMomentDateStrFormat, handleResizedColumns } from 'src/app/shared/functions/utilities';
import { PortfolioModellerService } from '../service/portfolio-modeller.service';

@Component({
  selector: 'app-monthly-returns',
  templateUrl: './monthly-returns.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss', './monthly-returns.component.scss'],
  providers: [AgGridScrollService]
})
export class MonthlyReturnsComponent implements OnInit {

  @Input() calcParams: MonthlyReturnsCalcParams;
  @Input() parentTab: ParentTabType;
  @Input() childTabIndex: number;
  @Output() status = new EventEmitter<LoadStatus>();
  
  subscriptions: Subscription[] = []
  columnDefsMonthlyRets: ColDef[]
  gridOptionsMonthlyRets: GridOptions
  monthlyReturns : any
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  modelName: string
  baseMeasure: string
  asOfDate: string
  gridApi: GridApi;
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';
  adaptableOptions: AdaptableOptions;
  adaptableApi: AdaptableApi;


  AMOUNT_COLUMNS:string[]=
  [ 
    'monthlyPnL',
    'baseMeasure',
    'accFeesEur',
    'accInterestEur'
  ];

  PERCENT_COLUMNS:string[]=
  [
    'returns'
  ];

  constructor(private monthlyReturnSvc: MonthlyReturnsService,
    private dtPipe: DatePipe,
    private dataSvc: DataService,
    private agGridScrollService:AgGridScrollService,
    private portfolioModellerService:PortfolioModellerService
  ) { }

  ngOnChanges(changes: SimpleChanges){

    let params = changes.calcParams.currentValue;
    this.baseMeasure = params?.['baseMeasure'];
    this.modelName = params?.['modelName'];
    this.asOfDate = params?.['asOfDate'];
    
    params['baseMeasureID'] = 3;
    this.subscriptions.push(this.monthlyReturnSvc.getMonthlyReturns(params).subscribe({
      next: (data: any[]) => {
        this.status.emit('Loaded')

        let monthlyReturns = []
        data?.forEach(ret => {
          let row = { ...ret, ...ret?.['mReturns'] }
          delete row['mReturns'];

          monthlyReturns.push(row)
        })

        this.monthlyReturns = monthlyReturns
      },
      error: (error) => {
        console.error(`Failed to get returns : ${error}`)
        this.monthlyReturns = []
        this.status.emit('Failed')
      }
    }))

  }

  aggFuncs = {
    'Return': (params: IAggFuncParams) => {

      let childData: any[] = getNodes(params.rowNode as RowNode, [])

      let sumPnL: number  = childData.reduce((n, {monthlyPnL}) => n + monthlyPnL, 0)
      let sumBaseMeasure: number = childData.reduce((n, {baseMeasure}) => n + baseMeasure, 0)

      if(sumBaseMeasure === 0)
        return 0.00
      else 
        return Number(Number(sumPnL / sumBaseMeasure));
      
    },
    'Sum': (params: IAggFuncParams) => {
      if(params.column.getColId() === 'monthlyPnL' || params.column.getColId() === 'baseMeasure'){
        return params.values.reduce((a, b) => Number(a) + Number(b), 0)
      }
    }
  }

  ngOnInit(): void {

    this.subscriptions.push(this.portfolioModellerService.matTabRemoved$.subscribe( x => {
      this.agGridScrollService.parentTabIndex = this.parentTab.index
    }))

    this.columnDefsMonthlyRets = [
      { field: 'asofDate', type:'abColDefDate', headerName: 'As Of Date', allowedAggFuncs: [], cellClass: 'dateUK', sort:'desc'},
      { field: 'issuerShortName', type: 'abColDefString', allowedAggFuncs: [] },
      { field: 'monthlyPnL', type: 'abColDefNumber', headerName: 'Monthly P&L', aggFunc: 'Sum', allowedAggFuncs: ['Sum'] },
      { field: 'baseMeasure', type: 'abColDefNumber', aggFunc: 'Sum', allowedAggFuncs: ['Sum'] },
      { field: 'returns', type: 'abColDefNumber', aggFunc: 'Return', allowedAggFuncs: ['Return'] },
      // { field: 'cumulativeReturn', valueFormatter: this.percentFormatter, aggFunc: 'Return', allowedAggFuncs: ['Return'] },
      { field: 'accFeesEur', type: 'abColDefNumber', aggFunc: 'sum', headerName: 'Fees' },
      { field: 'accInterestEur', type: 'abColDefNumber', aggFunc: 'sum', headerName: 'Interest' },
    ]

    this.gridOptionsMonthlyRets = {
      ...CommonConfig.GRID_OPTIONS, 
      ...CommonConfig.ADAPTABLE_GRID_OPTIONS,
      enableRangeSelection: true,
      sideBar: ['filters','adaptable'],
      columnDefs: this.columnDefsMonthlyRets,
      suppressAggFuncInHeader: true,
      rowData: this.monthlyReturns,
      autoGroupColumnDef: {
        sort: 'desc'
      },
      rowHeight: 30,
      groupHeaderHeight: 30,
      headerHeight: 30,
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES,
      aggFuncs: this.aggFuncs,
      defaultColDef: {
        resizable: true,
        sortable: false,
        filter: true,
        lockPosition: true,
        enableValue: true,
        lockPinned: true
      },
      onGridReady: (params: GridReadyEvent) => {
        params.api.closeToolPanel()
        this.gridApi = params.api;  

      },
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
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
      adaptableId: 'Monthly Returns',
      adaptableStateKey: 'Monthly Returns Key',    
      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)
      }, 
      entitlementOptions : {
        moduleEntitlements: [
          {
            adaptableModule: 'Layout',
            accessLevel: 'Hidden'
          },
          {
            adaptableModule: 'FormatColumn',
            accessLevel: 'Hidden'
          },
          {
            adaptableModule: 'StyledColumn',
            accessLevel: 'Hidden'
          },
          {
            adaptableModule: 'FlashingCell',
            accessLevel: 'Hidden'
          },
          {
            adaptableModule: 'CalculatedColumn',
            accessLevel: 'Hidden'
          },
          {
            adaptableModule: 'CustomSort',
            accessLevel: 'Hidden'
          },
          {
            adaptableModule: 'Dashboard',
            accessLevel: 'ReadOnly'
          }
        ]
      },
  
       exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,           
       
      userInterfaceOptions:{
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter',[...this.AMOUNT_COLUMNS]),
          {
            id: 'percentFormatter',
            label: 'percentFormatter',
            scope:   {
              ColumnIds: this.PERCENT_COLUMNS
            },
            handler:(customDisplayFormatterContext: CustomDisplayFormatterContext)=>{
              let currentValue: any = customDisplayFormatterContext.cellValue
                  return `${Number(currentValue * 100).toFixed(2)}%`         
           }
          },
          
        ]
      },     
      predefinedConfig: {
        Dashboard: {
          Revision:11,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          IsHidden: false,
        },  
        Layout:{
          CurrentLayout: 'Basic Monthly Returns Layout',
          Revision: 18,
          Layouts: [{
            Name: 'Basic Monthly Returns Layout',
            Columns: this.columnDefsMonthlyRets.filter(def => !def.hide).map(def => def.field),
            RowGroupedColumns: ['asofDate'],
            AggregationColumns : {
              monthlyPnL: true,
              baseMeasure: true,
              returns: true,
              accFeesEur: true,
              accInterestEur: true
            }
          }]
        },
        FormatColumn:{
          Revision:27,
          FormatColumns:[
            CUSTOM_FORMATTER([...this.AMOUNT_COLUMNS],['amountFormatter']),
            CUSTOM_FORMATTER([...this.PERCENT_COLUMNS],['percentFormatter']),
            BLANK_DATETIME_FORMATTER_CONFIG(['asofDate']),
            DATE_FORMATTER_CONFIG_MMMyy(['asofDate']),
          ]
        },
        StatusBar: {
          Revision: 4,
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


  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adaptableApi = adaptableApi;
    this.adaptableApi.toolPanelApi.closeAdapTableToolPanel();  
    this.adaptableApi.dashboardApi.setDashboardTitle(`Monthly Returns`)
    this.agGridScrollService.gridApi = this.gridOptionsMonthlyRets.api
    this.agGridScrollService.childTabIndex = this.childTabIndex
    this.agGridScrollService.parentTabIndex = this.parentTab.index  

  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
  }

}
