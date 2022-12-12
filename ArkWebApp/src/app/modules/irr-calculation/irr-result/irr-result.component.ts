import { AdaptableApi, AdaptableOptions, ColumnSort } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, ColGroupDef, GridOptions, Module, SortController, ValueFormatterParams } from '@ag-grid-community/core';
import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { first, switchMap, takeUntil } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { saveAndSetLayout } from 'src/app/shared/functions/dynamic.parse';
import { amountFormatter, noDecimalAmountFormatter, nonAmountNumberFormatter2Dec } from 'src/app/shared/functions/formatter';
import { setSharedEntities, getSharedEntities } from 'src/app/shared/functions/utilities';
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

  mapGroupColDefs: ColDef[] = [
    { field: 'Fund', type: 'abColDefString', cellClass: '', minWidth: 122},
    { field: 'DealTypeCS', type: 'abColDefString', cellClass: '' },
    { field: 'Issuer Short Name', type: 'abColDefString', cellClass: ''},
    { field: 'Seniority', type: 'abColDefString', cellClass: '', minWidth: 155 }
    // Sort Order will always be part in the result set. So adding it in calcColDefs at the end.
  ]

  paggrColDefs: ColDef[] = [
    { field: 'DealName', type: 'abColDefString', cellClass: '' },
    { field: 'DealCcy', type: 'abColDefString', cellClass: '', minWidth: 115 },
  ]

  sortColDefs: ColDef[] = [
    { field: 'Sort Order1', type: 'abColDefString' },
    { field: 'Sort Order2', type: 'abColDefString' },
    { field: 'Sort Order', type: 'abColDefString' }
  ]

  calcColDefs: ColDef[] = [    
    { field: 'CapitalInvestedEur', valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber', minWidth: 180 },
    { field: 'RealizedProceedsEur', valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber', minWidth: 185 },
    { field: 'CashCarryingValueEur', valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber', minWidth: 200 },
    { field: 'CashIRR', valueFormatter: this.percentFormatter, minWidth: 110},
    { field: 'YTE', headerName: 'YTE', valueFormatter: this.percentFormatter, minWidth: 95},
    { field: 'CurrentYTE', headerName: 'Current YTE', valueFormatter: this.percentFormatter, minWidth: 130},
    { field: 'YTEHedged', headerName: 'YTE Hedged', valueFormatter: this.percentFormatter, minWidth: 135},
    { field: 'YTW', headerName: 'YTW', valueFormatter: this.percentFormatter, minWidth: 88},
    { field: 'CurrentYTW', valueFormatter: this.percentFormatter, minWidth: 136},
    { field: 'YTWHedged', headerName: 'YTW Hedged', valueFormatter: this.percentFormatter, minWidth: 136},
    { field: 'DiscountPriceE', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 154 },
    { field: 'DiscountPriceW', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 154 },
    { field: 'NPVE', headerName: 'NPVE', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 140 },
    { field: 'NPVEActual', headerName: 'NPVE Actual',valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 140 },
    { field: 'NPVEMinus100', headerName: 'NPVE -100',valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 140 },
    { field: 'NPVEPlus100', headerName: 'NPVE +100',valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 140 },
    { field: 'Cost', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 85 },
    { field: 'Mark', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 85 },
    { field: 'ExpectedPrice', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 150 },
    { field: 'ExpectedAge', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber', minWidth: 133},
    { field: 'AccFees', headerName: 'Accrued Fees', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 133 },
    { field: 'AccInterest', headerName: 'Accrued Interest', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 153  },
    { field: 'CashYield', valueFormatter: this.percentFormatter, minWidth: 117},   
    { field: 'AverageCashMargin', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 180 },
    { field: 'CashMargin', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 130 },
    { field: 'PIKMargin', headerName: 'PIK Margin', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 121 },
    { field: 'UnfundedMargin', headerName: 'Unfunded Margin', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 170 }, 
    { field: 'NetLTV', headerName: 'Net LTV', valueFormatter: this.percentFormatter, type: 'abColDefNumber', minWidth: 110 },
    { field: 'NetLTVAtInvestement', headerName: 'Net LTV at Inv', valueFormatter: this.percentFormatter, type: 'abColDefNumber', minWidth: 145 },
    { field: 'NetLeverage', headerName: 'Net Leverage', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 136 },
    { field: 'NetLeverageAtInvestment', headerName: 'Net Leverage at Inv', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 180 },
    { field: 'EBITDA', headerName: 'EBITDA(\u20AC)', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 120 },
    { field: 'EBITDAAtInvestment', headerName: 'EBITDA at Inv(\u20AC)', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 155 },
    { field: 'ReportingEBITDA', headerName: 'Reporting EBITDA(\u20AC)', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 185 },
    { field: 'ReportingNetLeverage', headerName: 'Reporting Net Leverage', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 200 },
    { field: 'Revenue', headerName: 'Revenue(\u20AC)', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 125 },
    { field: 'RevenueAtInvestment', headerName: 'Revenue at Inv(\u20AC)', valueFormatter: amountFormatter, type: 'abColDefNumber', minWidth: 200 },
    { field: 'ReportingNetLeverageComment', headerName: 'Reporting Net Leverage Comment', type: 'abColDefString', cellClass: '', minWidth: 300 },

    { field: 'AllInRate', hide:true, valueFormatter: amountFormatter,  type: 'abColDefNumber',},
    { field: 'CostValue', hide:true, valueFormatter: amountFormatter, type: 'abColDefNumber' },
    { field: 'ExitPrice', hide:true, valueFormatter: amountFormatter, type: 'abColDefNumber' },
    { field: 'FaceValue', hide:true, valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber' },
    { field: 'FaceValueExpected', hide:true, valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber' },
    { field: 'AverageLifeE', hide:true, valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
    { field: 'AverageLifeW', hide:true, valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
    { field: 'CashMOM', hide:true, valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
    { field: 'MOME', hide:true, headerName: 'MOM E', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
    { field: 'MOMW', hide:true, headerName: 'MOM W', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
    { field: 'PaybackE', hide:true, headerName: 'Payback E', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
    { field: 'PaybackW', hide:true, valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
    { field: 'TotalRealizedIncome', hide:true, valueFormatter: amountFormatter, type: 'abColDefNumber' },
    { field: 'RealisedUnrealised', hide:true, type: 'abColDefString'},

  ]

  closeTimer = new Subject<any>();

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
      deltaRowDataMode: true
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
        setSharedEntities: setSharedEntities.bind(this),
        getSharedEntities: getSharedEntities.bind(this)  
      },

      userInterfaceOptions: {
        styleClassNames: [
          'realised-unrealised'
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
          Revision: 12,
          ConditionalStyles: [
            {
              Scope: {All: true},
              Style: {
                BackColor: '#0590ca',
                FontWeight: 'Bold'
              },
              Rule: {
                BooleanExpression: '[Issuer Short Name] =  "Total"'
              }
            },
            {
              Scope: {All: true},
              Style: {
                BackColor: '#69bcdf',
                FontWeight: 'Bold'
              },
              Rule: {
                BooleanExpression: '[Issuer Short Name] =  "Realised" OR [Issuer Short Name] = "Unrealised"  OR [Seniority] = "Total"' 
              }
            },
            {
              Scope: {All: true},
              Style: {
                BackColor: '#69bcdf',
                FontWeight: 'Bold'
              },
              Rule: {
                BooleanExpression: '[Issuer Short Name] =  "Realised" OR [Issuer Short Name] = "Unrealised"' 
              }
            },
          ]
        },
        Layout: {
          Revision: 13,
          CurrentLayout: 'Default IRR Result',
          Layouts: [
          {
            Name: 'Default IRR Result',
            Columns: [
              'Fund',
              'Issuer Short Name',
              'Deal Type CS',
              'DealName',
              'DealCcy',
              'CapitalInvestedEur',
              'RealizedProceedsEur',
              'CashCarryingValueEur',
              'CashIRR',
              'YTE',
              'CurrentYTE',
              'YTEHedged',
              'YTW',
              'CurrentYTW',
              'YTWHedged',
              'DiscountPriceE',
              'DiscountPriceW',
              'NPVE',
              'NPVEActual',
              'NPVEMinus100',
              'NPVEPlus100',
              'Cost',
              'Mark',
              'ExpectedPrice',
              'ExpectedAge',
              'CashMargin',
              'CashYield',
              'PIKMargin',
              'AllInRate',
              'AccFees',
              'AccInterest',
              'UnfundedMargin',
              'NetLTV',
              'NetLTVAtInvestement',
              'NetLeverage',
              'NetLeverageAtInvestment',
              'EBITDA',
              'EBITDAAtInvestment',
              'ReportingEBITDA',
              'ReportingNetLeverage',
              'Revenue',
              'RevenueAtInvestment',
              'ReportingNetLeverageComment',
              // 'averageLifeE', 
              // 'averageLifeW',
              // 'cashMOM', 
              // 'mome', 
              // 'momw', 
              // 'paybackE',
              // 'paybackW',
              // 'totalRealizedIncome',
              // 'realisedUnrealised',
              'Sort Order' 
            ],
            ColumnSorts: [
              {
                ColumnId: 'Fund',
                SortOrder: 'Asc'
              },
              {
                ColumnId: 'Sort Order',
                SortOrder: 'Asc'
              },
              {
                ColumnId: 'Issuer Short Name',
                SortOrder: 'Asc'
              }
            ]
          }]
        },
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
                  
                  let calcs = []
                  let mapGroupCols: string[] = [];
                  let paggrCols: string[] = [];
                  
                  if(res?.['output']?.length > 0){
                    mapGroupCols = Object.keys(res?.['output'][0].MapGroupColValues);
                    paggrCols = Object.keys(res?.['output'][0].paggr);
                  }

                  this.columnDefs = [ 
                    ...this.mapGroupColDefs.filter(c => mapGroupCols.includes(c.field)),
                    ...this.paggrColDefs.filter(c => paggrCols.includes(c.field)),
                    ...this.calcColDefs,
                    ...this.sortColDefs.filter(c => mapGroupCols.includes(c.field))
                  ]

                  this.gridOptions?.api?.setColumnDefs(this.columnDefs);

                  let cSorts: ColumnSort[] = []

                  if(mapGroupCols.includes('Fund'))
                    cSorts.push({ ColumnId: 'Fund', SortOrder: 'Asc' });

                  if(mapGroupCols.includes('DealTypeCS'))
                    cSorts.push({ ColumnId: 'DealTypeCS', SortOrder: 'Asc' })

                  if(mapGroupCols.includes('Sort Order'))
                    cSorts.push({ ColumnId: 'Sort Order', SortOrder: 'Asc' });

                  if(mapGroupCols.includes('Sort Order1'))
                    cSorts.push({ ColumnId: 'Sort Order1', SortOrder: 'Asc' });

                  if(mapGroupCols.includes('Issuer Short Name'))
                    cSorts.push({ ColumnId: 'Issuer Short Name', SortOrder: 'Asc' });

                  if(mapGroupCols.includes('Sort Order2'))
                    cSorts.push({ ColumnId: 'Sort Order2', SortOrder: 'Asc' });

                  if(mapGroupCols.includes('Seniority'))
                    cSorts.push({ ColumnId: 'Seniority', SortOrder: 'Asc'});

                  saveAndSetLayout(this.columnDefs.filter(c => !c?.['hide']), this.adapTableApi, 'IRR Result', cSorts);

                  for(let i = 0 ; i < res?.['output'].length; i++){
                    let calcProps: string[] = Object.keys(res?.['output'][i].calcHelper)
                    let paggrProps: string[] = Object.keys(res?.['output'][i].paggr)
                    
                    let paggr = {}
                    paggrProps.filter(p => !calcProps.includes(p)).forEach(p => {
                      paggr[p] = res?.['output'][i].paggr[p]
                    });


                    calcs.push({... res?.['output'][i].calcHelper, ... res?.['output'][i].MapGroupColValues, ... paggr })
                  }
                  this.calcs = calcs
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

  ngOnChanges(changes: SimpleChanges){


    if(this.calcParams !== null){
      this.runID = this.calcParams.runID;

      this.asOfDate = this.calcParams.asOfDate;
      this.positionIDs = this.calcParams.positionIDs;
      this.modelID = this.calcParams.modelID;
      this.modelName = this.calcParams.modelName;
      this.aggregationType = this.calcParams.irrAggrType
      
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
}
