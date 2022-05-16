import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, ColGroupDef, GridOptions, Module, ValueFormatterParams } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule } from '@ag-grid-enterprise/all-modules';
import { Location } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { amountFormatter, nonAmountNumberFormatter2Dec } from 'src/app/shared/functions/formatter';
import { IRRCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-irr-result',
  templateUrl: './irr-result.component.html',
  styleUrls: ['./irr-result.component.scss']
})
export class IrrResultComponent implements OnInit {
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
  
  constructor(
    private irrCalcSvc: IRRCalcService,
    private router: Router,
    private elementRef: ElementRef
  ) { }

  goBack(){
    this.router.navigate(['/irr/portfoliomodeller'])
  }

  fetchIRRCalculations(){
    console.log("Called fetch IRR calcs")
    let model: IRRCalcParams = <IRRCalcParams>{};
    model.asOfDate = this.asOfDate
    model.positionIDs = this.positionIDs
    model.modelID = this.modelID
    this.subscriptions.push(this.irrCalcSvc.getIRRCalculation(model).subscribe({
      next: data => {
        console.log(data)
        this.calcs = this.cashFlows = []

        let calcs = []
        for(let i: number = 0; i < data.length; i++){
          let calc = data[i].calcHelper;
          calc = {
            ...calc, 
            issuerID: data[i].mapGroupColValues['IssuerId'],
            issuerShortName: data[i].mapGroupColValues['Issuer Short Name'],
            fund: data[i].mapGroupColValues['Fund'],
            realisedUnrealised: data[i].mapGroupColValues['RealisedUnrealised']
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
      { field: 'yte',
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
      { field: 'ytw',
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
      {field: 'mome', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'momw', valueFormatter: nonAmountNumberFormatter2Dec},
      {field: 'paybackE'},
      {field: 'paybackW'},
      {field: 'totalRealizedIncome', valueFormatter: amountFormatter},
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

  ngOnDestroy(){
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
    this.elementRef.nativeElement.remove();
  }
}
