import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, ColGroupDef, GridOptions, Module, ValueFormatterParams } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, nonAmountNumberFormatter2Dec } from 'src/app/shared/functions/formatter';
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
            sortOrder: data[i].mapGroupColValues['Sort Order']
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
      { field: 'capitalInvestedEur', valueFormatter: amountFormatter},
      {field: 'realizedProceedsEur', valueFormatter: amountFormatter},
      { field: 'cashCarryingValueEur', valueFormatter: amountFormatter},
      { field: 'cashIRR', 
        valueFormatter: (params : ValueFormatterParams) => {
        if(params.node.group)
          return " "
        else{
          return `${Number(params.value * 100).toFixed(2)}%`
        }
      }},
      { field: 'yte', headerName: 'YTE',
      valueFormatter: (params : ValueFormatterParams) => {
        if(params.node.group)
          return " "
        else{
          return `${Number(params.value * 100).toFixed(2)}%`
        }
      }},
      {field: 'currentYTE',
      valueFormatter: (params : ValueFormatterParams) => {
        if(params.node.group)
          return " "
        else{
          return `${Number(params.value * 100).toFixed(2)}%`
        }
      }},
      { field: 'yteHedged',
      valueFormatter: (params : ValueFormatterParams) => {
        if(params.node.group)
          return " "
        else{
          return `${Number(params.value * 100).toFixed(2)}%`
        }
      }},
      { field: 'ytw', headerName: 'YTW',
      valueFormatter: (params : ValueFormatterParams) => {
        if(params.node.group)
          return " "
        else{
          return `${Number(params.value * 100).toFixed(2)}%`
        }
      }},
      {field: 'currentYTW',
      valueFormatter: (params : ValueFormatterParams) => {
        if(params.node.group)
          return " "
        else{
          return `${Number(params.value * 100).toFixed(2)}%`
        }
      }},
      { field: 'ytwHedged',
      valueFormatter: (params : ValueFormatterParams) => {
        if(params.node.group)
          return " "
        else{
          return `${Number(params.value * 100).toFixed(2)}%`
        }
      }},

      { field: 'averageLifeE', valueFormatter: nonAmountNumberFormatter2Dec},
      { field: 'averageLifeW', valueFormatter: nonAmountNumberFormatter2Dec},
      { field: 'cashMOM', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'mome', headerName: 'MOM E', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'momw', headerName: 'MOM W', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'paybackE'},
      {field: 'paybackW'},
      {field: 'totalRealizedIncome', valueFormatter: amountFormatter},
      {field: 'realisedUnrealised'},
      {field: 'pikmargin', headerName: 'PIK Margin', valueFormatter: amountFormatter},
      {field: 'unfundedMargin', headerName: 'Unfunded Margin', valueFormatter: amountFormatter},
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
        Layout: {
          Revision: 5,
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
              'averageLifeE', 
              'averageLifeW',
              'pikmargin',
              'unfundedMargin', 
              'cashMOM', 
              'mome', 
              'momw', 
              'paybackE',
              'paybackW',
              'totalRealizedIncome',
              'realisedUnrealised',
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
