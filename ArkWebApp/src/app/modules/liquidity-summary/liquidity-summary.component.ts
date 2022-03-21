import { Component, OnInit } from '@angular/core';

import {
  ColDef,
  GridOptions,
  IAggFunc,
  IAggFuncParams,
  Module,
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';

import { dateFormatter, amountFormatter, dateTimeFormatter } from 'src/app/shared/functions/formatter';
import { Subscription } from 'rxjs';
import { LiquiditySummaryService } from 'src/app/core/services/LiquiditySummary/liquidity-summary.service';
import { DataService } from 'src/app/core/services/data.service';
import { MatDialog }  from '@angular/material/dialog';
import { AddModalComponent } from './add-modal/add-modal.component';

@Component({
  selector: 'app-liquidity-summary',
  templateUrl: './liquidity-summary.component.html',
  styleUrls: ['./liquidity-summary.component.scss']
})
export class LiquiditySummaryComponent implements OnInit {

  subscriptions: Subscription[] = [];
  constructor(private liquiditySummarySvc: LiquiditySummaryService,
              private dataSvc: DataService,
              public dialog: MatDialog) { }

  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];

  gridOptions: GridOptions;
  
  /** Filter Pane fields */
  asOfDate: string = null;
  fundHedgings: string[] = null;

  rowData = null;

  columnDefs: ColDef[]

  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: false,
    sortable: false,
    filter: true,
    autosize:true,
  }

  isWriteAccess: boolean = false;

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  parseFetchedSummary(summary: {date: Date, attr: string, fundHedgingAmount: { fundHedging: string, amount: number}[]}[] = null): any{
    let parsedData = []
    for(let i:number = 0; i < summary.length; i+= 1){
      let row = {};
      row['attr'] = summary[i]['attr'];
      row['date'] = summary[i]['date'];
      row['attrType'] = summary[i]['attrType'];
      for(let j: number = 0; j < summary[i].fundHedgingAmount.length; j+= 1){
        let FHAmountPair = summary[i].fundHedgingAmount[j]
        row[FHAmountPair.fundHedging] = Number(FHAmountPair.amount);
      }
      parsedData.push(row);
    }

    return parsedData;
  }

  aggFuncs = {
    'Sum': (params: IAggFuncParams )=> {
      // console.log(params)

      let sum: number = 0;
      let colName: string = params.column.getColId();

      if(params.rowNode.group){

        if (params.rowNode.key === 'Current Cash') {

          for(let i:number = 0; i < params.values.length; i+= 1){
            sum += params.values[i];
          }
        }
        else if(params.rowNode.key === 'Net Cash') {

          for(let i: number = 0; i < this.rowData.length; i+= 1){

            if(['Current Cash', 'Net Cash'].includes(this.rowData[i].attrType))
              sum += this.rowData[i]?.[colName];
          }
        }
        else if(params.rowNode.key === 'Liquidity'){

          for(let i: number = 0; i < this.rowData.length; i+= 1){

            if(['Current Cash', 'Net Cash', 'Liquidity'].includes(this.rowData[i].attrType))
              sum += this.rowData[i]?.[colName];
          }
        }
        else if(params.rowNode.key === 'Known Outflows'){

          for(let i: number = 0; i < this.rowData.length; i+= 1){

            if(['Known Outflows'].includes(this.rowData[i].attrType))
              sum += this.rowData[i]?.[colName];
          }
        }
        else if(params.rowNode.key === 'Cash Post Known Outflows'){

          for(let i: number = 0; i < this.rowData.length; i+= 1){

            if(['Current Cash', 'Net Cash', 'Liquidity', 'Known Outflows'].includes(this.rowData[i].attrType))
              sum += this.rowData[i]?.[colName];
          }
        }
      }
      return sum;
    }
  }

  createColumnDefs(row: {date: Date, attr: string, fundHedgingAmount: { fundHedging: string, amount: number}[]} = null){
    this.columnDefs = [
      {
        field: 'date',
        valueFormatter: dateFormatter,
        width: 115,
      },
      {
        headerName: 'Attribute',
        field: 'attr',
        tooltipField: 'attr',
      },
      {
        headerName: 'Attribute Type',
        field: 'attrType',
        rowGroup: true,
        hide: true
      }
    ];

    if(!row)
      return;

    for(let i:number = 0; i < row.fundHedgingAmount.length; i+= 1){
      let FH: string = row.fundHedgingAmount[i].fundHedging;
      let colDef: ColDef = {
        field: FH,
        headerName: FH,
        valueFormatter: amountFormatter,
        width: 133,
        cellClass: 'ag-right-aligned-cell',
        allowedAggFuncs: ['Sum', 'min', 'max'],
        aggFunc: 'Sum',
      }
      
      this.columnDefs.push(colDef);
    }
  }

  fetchLiquiditySummary(){

    if(this.asOfDate !== null)
    this.subscriptions.push(this.liquiditySummarySvc.getLiquiditySummaryPivoted(this.asOfDate, this.fundHedgings).subscribe({
      next: summary => {

        if(summary.length > 0){
          this.createColumnDefs(summary[0]);
          this.rowData = this.parseFetchedSummary(summary);  

          this.gridOptions.api.setColumnDefs(this.columnDefs);
        }
        else{
          this.createColumnDefs();
          this.rowData = null;
        }
        
      },
      error: error => {
        console.error("Error in fetching liquidity summary" + error);
      }
    }));
    else
      console.warn("Component loaded without setting date in filter pane");
  }

  onGridReady(params: any){
    params.api.closeToolPanel();
  }

  openDialog(actionType: string = 'ADD'): void {
    const dialogRef = this.dialog.open(AddModalComponent,{
      data: {
        action: actionType,
        fundHedgings: this.fundHedgings,
        asOfDate: this.asOfDate
      }
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      
    }))
  }
  
  ngOnInit(): void {
    this.gridOptions = {
      suppressAggFuncInHeader: true,
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      undoRedoCellEditing: false,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      aggFuncs: this.aggFuncs
    }

    this.subscriptions.push(this.dataSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;

    }));

    this.subscriptions.push(this.dataSvc.currentSearchTextValues.subscribe(fundHedgings => {
      this.fundHedgings = fundHedgings;
    }))

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.fetchLiquiditySummary();
      }
    }))

  }

}
