import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, ColGroupDef, GridOptions, Module, ValueFormatterParams } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, noDecimalAmountFormatter, nonAmountNumberFormatter2Dec } from 'src/app/shared/functions/formatter';
import { IRRCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-irr-result',
  templateUrl: './irr-result.component.html',
  styleUrls: ['./irr-result.component.scss']
})
export class IrrResultComponent implements OnInit {

  @Input() calcParams: IRRCalcParams;

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
  
  constructor(
    private irrCalcSvc: IRRCalcService,
    private dataSvc: DataService,
    private router: Router,
    private elementRef: ElementRef
  ) { }

  percentFormatter(params : ValueFormatterParams) {
    if(params.node.group)
      return " "
    else{
      return `${Number(params.value * 100).toFixed(2)}%`
    }
  }

  fetchIRRCalculations(){
    let model: IRRCalcParams = <IRRCalcParams>{};
    model.asOfDate = this.asOfDate
    model.positionIDs = this.positionIDs
    model.modelID = this.modelID
    this.gridOptions?.api.showLoadingOverlay();
    this.subscriptions.push(this.irrCalcSvc.getIRRCalculation(model).subscribe({
      next: data => {
        this.gridOptions?.api.hideOverlay();
        this.calcs = this.cashFlows = []

        let calcs = []
        for(let i: number = 0; i < data.length; i++){
          let calc = data[i].calcHelper;
          calc = {
            ...calc, 
            issuerID: data[i].mapGroupColValues['IssuerId'],
            issuerShortName: data[i].mapGroupColValues['Issuer Short Name'],
            fund: data[i].mapGroupColValues['Fund'],
            realisedUnrealised: data[i].mapGroupColValues['RealisedUnrealised'],
            sortOrder: data[i].mapGroupColValues['Sort Order'],
            
            accruedFees: data[i].paggr['accFees'],
            accruedInterest: data[i].paggr['accInterest'],
            allInRate: data[i].paggr['allInRate'],
            averageCashMargin: data[i].paggr['averageCashMargin'],
            cashMargin: data[i].paggr['cashMargin'],
            cashYield: data[i].paggr['cashYield'],
            cost: data[i].paggr['cost'],
            costValue: data[i].paggr['costValue'],
            exitPrice: data[i].paggr['exitPrice'],
            expectedPrice: data[i].paggr['expectedPrice'],
            expectedAge: data[i].paggr['expectedAge'],
            faceValue: data[i].paggr['faceValue'],
            faceValueExpected: data[i].paggr['faceValueExpected'],
            mark: data[i].paggr['mark'],
            pikMargin: data[i].paggr['pikMargin'],
            unfundedMargin: data[i].paggr['unfundedMargin']
          }
          calcs.push(calc);
          this.cashFlows.push(data[i].cfList);
        }

        this.calcs = calcs;
      },
      error: error => {
        this.calcs = []
        console.error(`Failed to fetch IRR Calculations` )
        console.error(error)
      }
    }))
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
      // { field: 'issuerID' },
      { field: 'fund'},
      { field: 'issuerShortName'},
      { field: 'capitalInvestedEur', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'realizedProceedsEur', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'cashCarryingValueEur', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'cashIRR', 
      valueFormatter: this.percentFormatter},
      {field: 'cost', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'mark', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'discountPriceE', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'discountPriceW', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'npve', headerName: 'NPVE', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'npveActual', headerName: 'NPVE Actual',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'npveMinus100', headerName: 'NPVE -100',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'npvePlus100', headerName: 'NPVE +100',valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'yte', headerName: 'YTE',
      valueFormatter: this.percentFormatter},
      {field: 'currentYTE', headerName: 'Current YTE',
      valueFormatter: this.percentFormatter},
      { field: 'yteHedged', headerName: 'YTE Hedged',
      valueFormatter: this.percentFormatter},
      { field: 'ytw', headerName: 'YTW',
      valueFormatter: this.percentFormatter},
      {field: 'currentYTW',
      valueFormatter: this.percentFormatter},
      { field: 'ytwHedged', headerName: 'YTW Hedged',
      valueFormatter: this.percentFormatter},
      { field: 'accruedFees', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'  },
      { field: 'accruedInterest', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell' },
      { field: 'allInRate', valueFormatter: amountFormatter },
      { field:  'averageCashMargin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'cashMargin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'cashYield', valueFormatter: amountFormatter},
      
      {field: 'costValue', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'exitPrice', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'expectedPrice', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'expectedAge', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'faceValue', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'faceValueExpected', valueFormatter: noDecimalAmountFormatter, cellClass: 'ag-right-aligned-cell'},
      { field: 'averageLifeE', valueFormatter: nonAmountNumberFormatter2Dec},
      { field: 'averageLifeW', valueFormatter: nonAmountNumberFormatter2Dec},
      { field: 'cashMOM', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'mome', headerName: 'MOM E', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'momw', headerName: 'MOM W', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'paybackE', headerName: 'Payback E', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'paybackW', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'totalRealizedIncome', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'realisedUnrealised'},
      {field: 'pikMargin', headerName: 'PIK Margin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      // {field: 'pikmargin', headerName: 'PIK Margin', valueFormatter: amountFormatter},
      {field: 'unfundedMargin', headerName: 'Unfunded Margin', valueFormatter: amountFormatter, cellClass: 'ag-right-aligned-cell'},
      {field: 'sortOrder'}
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
        setSharedEntities: this.setSharedEntities.bind(this),
        getSharedEntities: this.getSharedEntities.bind(this)
  
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
          Revision: 7,
          ConditionalStyles: [
            {
              Scope: {All: true},
              Style: {
                BackColor: '#0590ca',
                FontWeight: 'Bold'
              },
              Rule: {
                BooleanExpression: '[issuerShortName] =  "Total"'
              }
            },
            {
              Scope: {All: true},
              Style: {
                BackColor: '#69bcdf',
                FontWeight: 'Bold'
              },
              Rule: {
                BooleanExpression: '[issuerShortName] =  "Realised"'
              }

            },
            {
              Scope: {All: true},
              Style: {
                BackColor: '#69bcdf',
                FontWeight: 'Bold'
              },
              Rule: {
                BooleanExpression: '[issuerShortName] =  "Unrealised"'
              }

            }

          ]
        },
        Layout: {
          Revision: 7,
          CurrentLayout: 'Default IRR Result',
          Layouts: [
          {
            Name: 'Default IRR Result',
            Columns: [
              'fund',
              'issuerShortName',
              'capitalInvestedEur',
              'realizedProceedsEur',
              'cashCarryingValueEur',
              'cashIRR',
              'yte',
              'currentYTE',
              'yteHedged',
              'ytw',
              'currentYTW',
              'ytwHedged',
              'discountPriceE',
              'discountPriceW',
              'npve',
              'npveActual',
              'npveMinus100',
              'npvePlus100',
              'cost',
              'mark',
              'expectedPrice',
              'expectedAge',
              'cashMargin',
              'cashYield',
              'pikMargin',
              'allInRate',
              'accruedFees',
              'accruedInterest',
              'unfundedMargin',
              // 'averageLifeE', 
              // 'averageLifeW',
              // 'cashMOM', 
              // 'mome', 
              // 'momw', 
              // 'paybackE',
              // 'paybackW',
              // 'totalRealizedIncome',
              // 'realisedUnrealised',
              'sortOrder' 
            ],
            ColumnSorts: [
              {
                ColumnId: 'fund',
                SortOrder: 'Asc'
              },
              {
                ColumnId: 'sortOrder',
                SortOrder: 'Asc'
              },
              {
                ColumnId: 'issuerShortName',
                SortOrder: 'Asc'
              }
            ]
          }]
        },
      }


    }
  }

  async getSharedEntities(adaptableId){
    return new Promise(resolve => {
      this.subscriptions.push(this.dataSvc.getAdaptableState(adaptableId).subscribe({
        next: state => {
          try {

            state = state.split('|').join('"')
            resolve(JSON.parse(state) ||'[]')
          } catch (e) {
            console.log("Failed to parse")
            resolve([])
          }
        }
      }));
    })
  }

  async setSharedEntities(adaptableId, sharedEntities): Promise<void>{

    return new Promise(resolve => {
      this.subscriptions.push(
        this.dataSvc.saveAdaptableState(adaptableId, JSON.stringify(sharedEntities).replace(/"/g,'|')).subscribe({
        next: data => {
          resolve();
        }
      }));
    })
  }

  ngOnInit(): void {
    this.Init();
    this.irrCalcSvc.currentCalcs.pipe(first()).subscribe(params => {
      if(params !== null){
        this.asOfDate = params.asOfDate;
        this.positionIDs = params.positionIDs;
        this.modelID = params.modelID;
        this.modelName = params.modelName;
        this.fetchIRRCalculations()
      }
    })
  }

  ngOnChanges(changes: SimpleChanges){
    this.asOfDate = this.calcParams.asOfDate;
    this.positionIDs = this.calcParams.positionIDs;
    this.modelID = this.calcParams.modelID;
    this.modelName = this.calcParams.modelName;
    this.fetchIRRCalculations()

  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
    this.elementRef.nativeElement.remove();
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
