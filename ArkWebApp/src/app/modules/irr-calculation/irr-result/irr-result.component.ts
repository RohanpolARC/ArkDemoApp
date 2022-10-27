import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, ColGroupDef, GridOptions, Module, ValueFormatterParams } from '@ag-grid-community/core';
import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, noDecimalAmountFormatter, nonAmountNumberFormatter2Dec } from 'src/app/shared/functions/formatter';
import { setSharedEntities, getSharedEntities } from 'src/app/shared/functions/utilities';
import { IRRCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-irr-result',
  templateUrl: './irr-result.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss', './irr-result.component.scss']
})
export class IrrResultComponent implements OnInit {

  @Input() calcParams: IRRCalcParams;
  @Output() status = new EventEmitter<string>();

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

  aggregationTypes = 
    {
      'Fund > Realised/Unrealised > Issuer Short Name' : ['IssuerFundMerged', 'FundRealisedUnrealised', 'Fund'],
      'Firmwide > Realised/Unrealised > Issuer Short Name' : ['IssuerFirmwide', 'FirmwideRealisedUnrealised', 'Firmwide']
    }

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
      autosize:true
    };

    this.columnDefs = [
      { field: 'IssuerID', type: 'abColDefNumber' },
      { field: 'Fund', type: 'abColDefString'},
      { field: 'Issuer Short Name', type: 'abColDefString'},
      { field: 'CapitalInvestedEur', valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      {field: 'RealizedProceedsEur', valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'CashCarryingValueEur', valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'CashIRR', 
      valueFormatter: this.percentFormatter},
      {field: 'Cost', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      {field: 'Mark', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'DiscountPriceE', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'DiscountPriceW', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'NPVE', headerName: 'NPVE', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'NPVEActual', headerName: 'NPVE Actual',valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'NPVEMinus100', headerName: 'NPVE -100',valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'NPVEPlus100', headerName: 'NPVE +100',valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'YTE', headerName: 'YTE',
      valueFormatter: this.percentFormatter},
      {field: 'CurrentYTE', headerName: 'Current YTE',
      valueFormatter: this.percentFormatter},
      { field: 'YTEHedged', headerName: 'YTE Hedged',
      valueFormatter: this.percentFormatter},
      { field: 'YTW', headerName: 'YTW',
      valueFormatter: this.percentFormatter},
      {field: 'CurrentYTW',
      valueFormatter: this.percentFormatter},
      { field: 'YTWHedged', headerName: 'YTW Hedged',
      valueFormatter: this.percentFormatter},
      { field: 'AccFees', headerName: 'Accrued Fees', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'  },
      { field: 'AccInterest', headerName: 'Accrued Interest', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell' },
      { field: 'AllInRate', valueFormatter: amountFormatter,  type: 'abColDefNumber',},
      { field:  'AverageCashMargin', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'CashMargin', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      {field: 'CashYield', valueFormatter: this.percentFormatter},
      
      {field: 'CostValue', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      {field: 'ExitPrice', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      {field: 'ExpectedPrice', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      {field: 'ExpectedAge', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
      {field: 'FaceValue', valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      {field: 'FaceValueExpected', valueFormatter: noDecimalAmountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      { field: 'AverageLifeE', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
      { field: 'AverageLifeW', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
      { field: 'CashMOM', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
      {field: 'MOME', headerName: 'MOM E', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
      {field: 'MOMW', headerName: 'MOM W', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
      {field: 'PaybackE', headerName: 'Payback E', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
      {field: 'PaybackW', valueFormatter: nonAmountNumberFormatter2Dec, type: 'abColDefNumber'},
      {field: 'TotalRealizedIncome', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      {field: 'RealisedUnrealised', type: 'abColDefString'},
      {field: 'PIKMargin', headerName: 'PIK Margin', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      // {field: 'pikmargin', headerName: 'PIK Margin', valueFormatter: amountFormatter} type: 'abColDefNumber',,
      {field: 'UnfundedMargin', headerName: 'Unfunded Margin', valueFormatter: amountFormatter, type: 'abColDefNumber', cellClass: 'ag-right-aligned-cell'},
      {field: 'Sort Order'}
    ]

    this.gridOptions = {
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      suppressAggFuncInHeader: true,
      rowGroupPanelShow: 'always'
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
          Revision: 9,
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
                BooleanExpression: '[Issuer Short Name] =  "Realised" OR [Issuer Short Name] = "Unrealised"'
              }

            },
          ]
        },
        Layout: {
          Revision: 11,
          CurrentLayout: 'Default IRR Result',
          Layouts: [
          {
            Name: 'Default IRR Result',
            Columns: [
              'Fund',
              'Issuer Short Name',
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
  }

  ngOnChanges(changes: SimpleChanges){
    if(this.calcParams !== null){
      this.asOfDate = this.calcParams.asOfDate;
      this.positionIDs = this.calcParams.positionIDs;
      this.modelID = this.calcParams.modelID;
      this.modelName = this.calcParams.modelName;
      this.aggregationType = this.calcParams.irrAggrType
      
      this.subscriptions.push(this.irrCalcSvc.getIRRCalculation(this.calcParams).subscribe({
        next: response => {

          timer(0, 10000).pipe(
            switchMap(() => this.irrCalcSvc.getIRRStatus(response?.['statusQueryGetUri'])),
            takeUntil(this.closeTimer)
          ).subscribe({
            next: (res: any) => {

              if(res?.['runtimeStatus'] === 'Completed'){
                let calcs = []
                for(let i = 0 ; i < res?.['output'].length; i++){
                  calcs.push({... res?.['output'][i].calcHelper, ... res?.['output'][i].MapGroupColValues, ... res?.['output'][i].paggr})
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
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    this.adapTableApi = adaptableApi;
    this.adapTableApi.toolPanelApi.closeAdapTableToolPanel();
  }
}
