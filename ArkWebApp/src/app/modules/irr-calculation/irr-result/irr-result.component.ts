import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, ColGroupDef, GridOptions, Module, ValueFormatterParams } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, noDecimalAmountFormatter, nonAmountNumberFormatter2Dec } from 'src/app/shared/functions/formatter';
import { setSharedEntities, getSharedEntities } from 'src/app/shared/functions/utilities';
import { IRRCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-irr-result',
  templateUrl: './irr-result.component.html',
  styleUrls: ['./irr-result.component.scss']
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
  agGridModules: Module[] = [
    ClientSideRowModelModule,
    RowGroupingModule,
    SetFilterModule,
    ColumnsToolPanelModule,
    MenuModule,
    ExcelExportModule
  ];
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
    if(params.node.group)
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
    };

    this.columnDefs = [
      { field: 'IssuerID' },
      { field: 'Fund'},
      { field: 'Issuer Short Name'},
      { field: 'CapitalInvestedEur', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'RealizedProceedsEur', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'CashCarryingValueEur', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'CashIRR', 
      valueFormatter: this.percentFormatter},
      {field: 'Cost', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'Mark', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'DiscountPriceE', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'DiscountPriceW', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'NPVE', headerName: 'NPVE', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'NPVEActual', headerName: 'NPVE Actual',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'NPVEMinus100', headerName: 'NPVE -100',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'NPVEPlus100', headerName: 'NPVE +100',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
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
      { field: 'AccFees', headerName: 'Accrued Fees', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'  },
      { field: 'AccInterest', headerName: 'Accrued Interest', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
      { field: 'AllInRate', valueFormatter: amountFormatter },
      { field:  'AverageCashMargin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'CashMargin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'CashYield', valueFormatter: this.percentFormatter},
      
      {field: 'CostValue', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'ExitPrice', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'ExpectedPrice', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'ExpectedAge', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'FaceValue', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'FaceValueExpected', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'AverageLifeE', valueFormatter: nonAmountNumberFormatter2Dec},
      { field: 'AverageLifeW', valueFormatter: nonAmountNumberFormatter2Dec},
      { field: 'CashMOM', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'MOME', headerName: 'MOM E', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'MOMW', headerName: 'MOM W', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'PaybackE', headerName: 'Payback E', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'PaybackW', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'TotalRealizedIncome', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'RealisedUnrealised'},
      {field: 'PikMargin', headerName: 'PIK Margin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      // {field: 'pikmargin', headerName: 'PIK Margin', valueFormatter: amountFormatter},
      {field: 'UnfundedMargin', headerName: 'Unfunded Margin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'Sort Order'}
    ]

    this.gridOptions = {
      enableRangeSelection: true,
      sideBar: true,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
      suppressAggFuncInHeader: true,
      rowGroupPanelShow: 'always'
    }
    
    this.adaptableOptions = {
      primaryKey: '',
      autogeneratePrimaryKey: true,
      userName: this.dataSvc.getCurrentUserName(),
      adaptableId: 'Adaptable ID',
      adaptableStateKey: 'Adaptable IRR Result key',

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
          Revision: 2,
          ModuleButtons: ['TeamSharing', 'Export', 'Layout', 'ConditionalStyle'],
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
          Revision: 10,
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
              'PikMargin',
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

  onAdaptableReady(
    {
      adaptableApi,
      vendorGrid,
    }: {
      adaptableApi: AdaptableApi;
      vendorGrid: GridOptions;
    }
  ) {
    this.adapTableApi = adaptableApi;
    adaptableApi.toolPanelApi.closeAdapTableToolPanel()
    adaptableApi.eventApi.on('SelectionChanged', selection => {
      // do stuff
    });
  }
}
