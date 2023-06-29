import { AdaptableApi, AdaptableOptions, ColumnSort, FormatColumn } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, ColGroupDef, GridOptions, Module, SortController, ValueFormatterParams } from '@ag-grid-community/core';
import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { first, switchMap, takeUntil } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';
import { saveAndSetLayout } from 'src/app/shared/functions/dynamic.parse';
import { amountFormatter, CUSTOM_DISPLAY_FORMATTERS_CONFIG, CUSTOM_FORMATTER, noDecimalAmountFormatter, nonAmountNumberFormatter2Dec } from 'src/app/shared/functions/formatter';
import { presistSharedEntities, loadSharedEntities } from 'src/app/shared/functions/utilities';
import { NoRowsCustomMessages } from 'src/app/shared/models/GeneralModel';
import { IRRCalcParams } from 'src/app/shared/models/IRRCalculationsModel';
import { LoadStatusType } from '../portfolio-modeller/portfolio-modeller.component';

@Component({
  selector: 'app-irr-result',
  templateUrl: './irr-result.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss', './irr-result.component.scss']
})
export class IrrResultComponent implements OnInit {

  @Input() calcParams: IRRCalcParams;
  @Output() status = new EventEmitter<LoadStatusType>();

  runID: string
  closeStream: Subject<any> = new Subject<any>();
  terminateUri: string

  aggregationType: string
  subscriptions: Subscription[] = []
  columnDefs: (ColDef | ColGroupDef)[];
  positionIDs: number[]
  asOfDate: string
  modelID: number
  adaptableOptions: AdaptableOptions
  gridOptions: GridOptions
  defaultColDef
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  calcs // Calchelper
  cashFlows // cfList
  modelName: string;
  adapTableApi: AdaptableApi;

  mapGroupColDefs: ColDef[] = []

  paggrColDefs: ColDef[] = [
    { field: 'DealName', type: 'abColDefString', cellClass: '' },
    { field: 'DealCcy', type: 'abColDefString', cellClass: '', minWidth: 115 },
  ]

  calcColDefs: ColDef[] = [    
    { field: 'CapitalInvestedEur', type: 'abColDefNumber', minWidth: 180 },
    { field: 'RealizedProceedsEur', type: 'abColDefNumber', minWidth: 185 },
    { field: 'GrossCostAmountEur', type: 'abColDefNumber', minWidth: 180, hide: true },
    { field: 'CashCarryingValueEur', type: 'abColDefNumber', minWidth: 200 },
    { field: 'CashIRR', minWidth: 110, type: 'abColDefNumber'},
    { field: 'YTE', headerName: 'YTE', minWidth: 95,type: 'abColDefNumber'},
    { field: 'CurrentYTE', headerName: 'Current YTE', minWidth: 130, type: 'abColDefNumber'},
    { field: 'YTEHedged', headerName: 'YTE Hedged', minWidth: 135, type: 'abColDefNumber'},
    { field: 'YTW', headerName: 'YTW', minWidth: 88, type: 'abColDefNumber'},
    { field: 'CurrentYTW', minWidth: 136, type: 'abColDefNumber'},
    { field: 'YTWHedged', headerName: 'YTW Hedged', minWidth: 136, type: 'abColDefNumber'},
    { field: 'DiscountPriceE', type: 'abColDefNumber', minWidth: 154 },
    { field: 'DiscountPriceW', type: 'abColDefNumber', minWidth: 154 },
    { field: 'NPVE', headerName: 'NPVE', type: 'abColDefNumber', minWidth: 140 },
    { field: 'NPVEActual', headerName: 'NPVE Actual', type: 'abColDefNumber', minWidth: 140 },
    { field: 'NPVEMinus100', headerName: 'NPVE -100', type: 'abColDefNumber', minWidth: 140 },
    { field: 'NPVEPlus100', headerName: 'NPVE +100', type: 'abColDefNumber', minWidth: 140 },
    { field: 'Cost', type: 'abColDefNumber', minWidth: 85 },
    { field: 'Mark', type: 'abColDefNumber', minWidth: 85 },
    { field: 'ExpectedPrice', type: 'abColDefNumber', minWidth: 150 },
    { field: 'ExpectedAge', type: 'abColDefNumber', minWidth: 133},
    { field: 'AccFees', headerName: 'Accrued Fees', type: 'abColDefNumber', minWidth: 133 },
    { field: 'AccInterest', headerName: 'Accrued Interest', type: 'abColDefNumber', minWidth: 153  },
    { field: 'CashYield', minWidth: 117, type: 'abColDefString'},   
    // { field: 'AverageCashMargin', type: 'abColDefNumber', minWidth: 180 },
    { field: 'CashMargin', type: 'abColDefNumber', minWidth: 130 },
    { field: 'PIKMargin', headerName: 'PIK Margin', type: 'abColDefNumber', minWidth: 121 },
    { field: 'UnfundedMargin', headerName: 'Unfunded Margin', type: 'abColDefNumber', minWidth: 170 }, 
    { field: 'NetLTV', headerName: 'Net LTV', type: 'abColDefNumber', minWidth: 110 },
    { field: 'NetLTVAtInvestement', headerName: 'Net LTV at Inv', type: 'abColDefNumber', minWidth: 145 },
    { field: 'NetLeverage', headerName: 'Net Leverage', type: 'abColDefNumber', minWidth: 136 },
    { field: 'NetLeverageAtInvestment', headerName: 'Net Leverage at Inv', type: 'abColDefNumber', minWidth: 180 },
    { field: 'EBITDA', headerName: 'EBITDA(\u20AC)', type: 'abColDefNumber', minWidth: 120 },
    { field: 'EBITDAAtInvestment', headerName: 'EBITDA at Inv(\u20AC)', type: 'abColDefNumber', minWidth: 155 },
    { field: 'ReportingEBITDA', headerName: 'Reporting EBITDA(\u20AC)', type: 'abColDefNumber', minWidth: 185 },
    { field: 'ReportingNetLeverage', headerName: 'Reporting Net Leverage', type: 'abColDefNumber', minWidth: 200 },
    { field: 'Revenue', headerName: 'Revenue(\u20AC)', type: 'abColDefNumber', minWidth: 125 },
    { field: 'SeniorityRevenue', headerName: 'Revenue(\u20AC)', type: 'abColDefNumber', minWidth: 125},
    { field: 'RevenueAtInvestment', headerName: 'Revenue at Inv(\u20AC)', type: 'abColDefNumber', minWidth: 200 },
    { field: 'SeniorityRevenueAtInvestment',  headerName: 'Revenue at Inv(\u20AC)', type: 'abColDefNumber', minWidth: 200 },
    { field: 'ReportingNetLeverageComment', headerName: 'Reporting Net Leverage Comment', type: 'abColDefString', cellClass: '', minWidth: 300 },
    { field: 'AllInRate', hide:true,  type: 'abColDefNumber',},
    { field: 'CostValue', hide:true, type: 'abColDefNumber' },
    { field: 'ExitPrice', hide:true, type: 'abColDefNumber' },
    { field: 'FaceValue', hide:true, type: 'abColDefNumber' },
    { field: 'FaceValueExpected', hide:true, type: 'abColDefNumber' },
    { field: 'AverageLifeE', hide:true, type: 'abColDefNumber'},
    { field: 'AverageLifeW', hide:true, type: 'abColDefNumber'},
    { field: 'CashMOM', hide:true, type: 'abColDefNumber'},
    { field: 'MOME', hide:true, headerName: 'MOM E', type: 'abColDefNumber'},
    { field: 'MOMW', hide:true, headerName: 'MOM W', type: 'abColDefNumber'},
    { field: 'PaybackE', hide:true, headerName: 'Payback E', type: 'abColDefNumber'},
    { field: 'PaybackW', hide:true, type: 'abColDefNumber'},
    { field: 'TotalRealizedIncome', hide:true, type: 'abColDefNumber' },

  ]

  closeTimer = new Subject<any>();
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';

  constructor(
    private irrCalcSvc: IRRCalcService,
    private dataSvc: DataService
  ) { }

  percentFormatter(params : ValueFormatterParams) {
    if(params.node?.group)
      return " "
    else{
      return `${Number(params.value * 100).toFixed(2)}%`
    }
  }

  Init(){
    this.defaultColDef = {
      resizable: true,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      sortable: true,
      filter: true,
      autosize:true,
      cellClass: 'ag-right-aligned-cell'
    };

    this.columnDefs = this.calcColDefs;

    this.gridOptions = {
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      suppressAggFuncInHeader: true,
      rowGroupPanelShow: 'always',
      suppressScrollOnNewData: true,
      noRowsOverlayComponent : NoRowsOverlayComponent,
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => this.noRowsToDisplayMsg,
      },
    }
    
    this.adaptableOptions = {
      licenseKey: CommonConfig.ADAPTABLE_LICENSE_KEY,
      primaryKey: '',
      autogeneratePrimaryKey: true,
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Adaptable ID',
      adaptableStateKey: 'Adaptable IRR Result key',

      exportOptions: CommonConfig.GENERAL_EXPORT_OPTIONS,

      teamSharingOptions: {
        enableTeamSharing: true,
        persistSharedEntities: presistSharedEntities.bind(this), 
        loadSharedEntities: loadSharedEntities.bind(this)  
      },

      userInterfaceOptions: {
        styleClassNames: [
          'realised-unrealised'
        ],
        customDisplayFormatters:[
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('amountFormatter', this.AMOUNT_COLUMNS),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('percentFormatter', this.PERCENT_COLUMNS),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('nonAmountNumberFormatter2Dec', this.NON_AMOUNT_2DEC_COLUMNS),
          CUSTOM_DISPLAY_FORMATTERS_CONFIG('noDecimalAmountFormatter', this.NO_DECIMAL_AMOUNT_COLUMNS),
        ]
      },

      predefinedConfig: {  
        Dashboard: {
          Revision: 3,
          ModuleButtons: CommonConfig.DASHBOARD_MODULE_BUTTONS,
          IsCollapsed: true,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],  
          IsHidden: false,
          DashboardTitle: ' '
        },
        ConditionalStyle:{
          Revision: 15,
        },
        Layout: {
          Revision: 14,
        },
        FormatColumn:{
          Revision:4,
          FormatColumns:[
            CUSTOM_FORMATTER([...this.calcColDefs.filter(x => x.type === 'abColDefNumber').map(x => x.field)], ['amountFormatter']),
           ]
        }
      }
    }
  }

  ngOnInit(): void {

    this.Init();

    this.irrCalcSvc.cashflowLoadStatusEvent.pipe(takeUntil(this.closeStream)).subscribe(
      e => {
        if(e.runID === this.runID && e.status === 'Loaded'){
          this.closeStream.complete();

          this.subscriptions.push(this.irrCalcSvc.getIRRCalculation(this.calcParams).subscribe({
          next: response => {
  
            this.terminateUri = response?.['terminatePostUri'];

            timer(0, 10000).pipe(
              switchMap(() => this.irrCalcSvc.getIRRStatus(response?.['statusQueryGetUri'])),
              takeUntil(this.closeTimer)
            ).subscribe({
              next: (res: any) => {
  
                if(res?.['runtimeStatus'] === 'Terminated'){
                  this.closeTimer.next();
                }
                else if(res?.['runtimeStatus'] === 'Completed'){
                  
                  let mapGroupCols: string[] = [];
                  let paggrCols: string[] = [];
                  
                  if(res?.['output']?.length > 0){
                    mapGroupCols = Object.keys(res?.['output'][0].MapGroupColValues);
                    paggrCols = Object.keys(res?.['output'][0].paggr);
                  }

                  this.setColumnDefs(mapGroupCols, paggrCols);
                  
                  this.setFormatColumns(res?.output);

                  saveAndSetLayout(this.columnDefs.filter(c => !c?.['hide']), this.adapTableApi, 'IRR Result');

                  this.updateCalcs(res?.['output']);
                  
                  this.status.emit('Loaded')
  
                  this.closeTimer.next();
                }
                else if(res?.['runtimeStatus'] === 'Failed'){
                  this.closeTimer.next();
                  this.status.emit('Failed')
                  this.calcs = [];
                }
              },
              error: (error) => {
                this.closeTimer.next();
                this.status.emit('Failed')
                this.calcs = []
                console.error(`Failed to fetch response: ${error}`);
    
              }
            })
          },
          error: error => {
            this.closeTimer.next();
            this.status.emit('Failed')
            this.calcs = []
            console.error(`Failed to fetch response: ${error}`);
          }
          }))  
        }
        else if(e.runID === this.runID && e.status === 'Failed'){
          this.closeStream.complete();
          this.status.emit('Failed')
        }
      }
    )
  }

  updateCalcs(output: any) {
    let calcs = []
    for(let i = 0 ; i < output.length; i++){
      let calcProps: string[] = Object.keys(output[i].calcHelper)
      let paggrProps: string[] = Object.keys(output[i].paggr)
      
      let paggr = {}
      paggrProps.filter(p => !calcProps.includes(p)).forEach(p => {
        paggr[p] = output[i].paggr[p]
      });

      calcs.push({... output[i].calcHelper, ... output[i].MapGroupColValues, ... paggr })
    }

    this.calcs = calcs
}

  setFormatColumns(output: any) {

    let allFormatColumns = this.adapTableApi.formatColumnApi.getFormatColumnState()
    allFormatColumns.FormatColumns.forEach(formatCol=>{
      this.adapTableApi.formatColumnApi.deleteFormatColumn(formatCol);
    })
    

    this.adapTableApi.formatColumnApi.addFormatColumns([ 
      ...this.getColourFormatColumns(output),
      ...[
        CUSTOM_FORMATTER(this.AMOUNT_COLUMNS,['amountFormatter']),
        CUSTOM_FORMATTER(this.PERCENT_COLUMNS,['percentFormatter']),
        CUSTOM_FORMATTER(this.NON_AMOUNT_2DEC_COLUMNS,['nonAmountNumberFormatter2Dec']),
        CUSTOM_FORMATTER(this.NO_DECIMAL_AMOUNT_COLUMNS,['noDecimalAmountFormatter'])
      ]
    ]);

  }

  setColumnDefs(mapGroupCols: string[], paggrCols: string[]) {

    this.rearrangeMapgroupColDefs(this.calcParams.aggrStr);

    let excludePaggrCols: string[] = [], excludeCalcCols: string[] = [];

    // DealName, DealCcy is only applicable for `Issuer Short Name`
    if(!mapGroupCols.includes("Issuer Short Name")){
      excludePaggrCols = [...excludePaggrCols, ...['DealName', 'DealCcy']]
    }
    if(mapGroupCols.includes("Seniority")){
      excludeCalcCols = [...excludeCalcCols, ...['Revenue', 'RevenueAtInvestment']]
    }
    else{
      excludeCalcCols = [...excludeCalcCols, ...['SeniorityRevenue', 'SeniorityRevenueAtInvestment']]
    }

    this.columnDefs = [ 
      ...this.mapGroupColDefs.filter(c => mapGroupCols.includes(c.field)),
      ...this.paggrColDefs.filter(c => paggrCols.includes(c.field) && !excludePaggrCols.includes(c.field)),
      ...this.calcColDefs.filter(c => !excludeCalcCols.includes(c.field))
    ]

    this.gridOptions?.api?.setColumnDefs(this.columnDefs);
  }

  getColourFormatColumns(output: any[]): FormatColumn[] {

    let formatCols: FormatColumn[] = []
    let colors: string[] = [... new Set(output.map(o => o?.['MapGroupColValues']?.['HexColour']))];

    colors.forEach(colour => 
      {
        if(colour){
          formatCols.push(
            <FormatColumn>{
              Scope: { All: true },
              Style: {
                BackColor: colour, FontWeight: 'Bold'
              },
              Rule: {
                BooleanExpression: `[HexColour] = "${colour}"`
              }
            }
          )
        }
      }
      
)
    
    return formatCols;
  }

  /* Re-arraning map-group columns based the aggregation order  */
  rearrangeMapgroupColDefs(aggrStr: string[]) {

    let coldefs: ColDef[] = [];
    for(let i: number = 0; i < aggrStr.length; i+=1 ){
      let defs: ColDef[] = this.mapGroupColDefs.filter(cd => cd.field === aggrStr[i]);
      coldefs = [ ...coldefs , ...defs ]
    }

    coldefs = [...coldefs,     { field: 'HexColour', type: 'abColDefString', cellClass: '', width: 150, hide: true }  ]
    this.mapGroupColDefs = coldefs; 
  }

  ngOnChanges(changes: SimpleChanges){


    if(this.calcParams !== null){
      this.runID = this.calcParams.runID;

      this.asOfDate = this.calcParams.asOfDate;
      this.positionIDs = this.calcParams.positionIDs;
      this.modelID = this.calcParams.modelID;
      this.modelName = this.calcParams.modelName;
      this.aggregationType = this.calcParams.irrAggrType
      

      // Setting mapGroupColDefs based on AggrStr
      this.mapGroupColDefs = [];
      this.calcParams.mapGroupCols.forEach(aggr => {
          this.mapGroupColDefs.push({ field: aggr, type: 'abColDefString', cellClass: '' })
      })

    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    }) 

    // Will give 410 result, if the instance is already completed.

    // Terminate cashflow save instance
    this.irrCalcSvc.terminateInstance(this.irrCalcSvc.terminateCashflowSaveUri).pipe(first()).subscribe();
    // Terminate irr calc instance
    this.irrCalcSvc.terminateInstance(this.terminateUri).pipe(first()).subscribe();
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adapTableApi = adaptableApi;
    this.adapTableApi.toolPanelApi.closeAdapTableToolPanel();
    this.gridOptions.columnApi.autoSizeColumns([ ...this.calcColDefs, ...this.paggrColDefs ].filter(x => x.minWidth).map(x => x.filter));
  }

  NO_DECIMAL_AMOUNT_COLUMNS=[
    'CapitalInvestedEur',
    'RealizedProceedsEur',
    'GrossCostAmountEur',
    'CashCarryingValueEur',
    'FaceValue',
    'FaceValueExpected'
    ]
    
    AMOUNT_COLUMNS = [
    'DiscountPriceE',
    'DiscountPriceW',
    'NPVE',
    'NPVEActual',
    'NPVEMinus100',
    'NPVEPlus100',
    'Cost',
    'Mark',
    'ExpectedPrice',
    'AccInterest',
    // 'AverageCashMargin',
    'CashMargin',
    'PIKMargin',
    'UnfundedMargin',
    'NetLeverage',
    'NetLeverageAtInvestment',
    'EBITDA',
    'EBITDAAtInvestment',
    'ReportingEBITDA',
    'ReportingNetLeverage',
    'Revenue',
    'RevenueAtInvestment',
    'SeniorityRevenue',
    'SeniorityRevenueAtInvestment',
    'AllInRate',
    'CostValue',
    'ExitPrice',
    'TotalRealizedIncome',
    'AccFees']
    
    NON_AMOUNT_2DEC_COLUMNS = ['ExpectedAge',
    'AverageLifeE',
    'AverageLifeW',
    'CashMOM',
    'MOME',
    'MOMW',
    'PaybackE',
    'PaybackW']
    
    PERCENT_COLUMNS = ['CashIRR',
    'YTE',
    'CurrentYTE',
    'YTEHedged',
    'YTW',
    'CurrentYTW',
    'YTWHedged',
    'CashYield',
    'NetLTV',
    'NetLTVAtInvestement']
  
}