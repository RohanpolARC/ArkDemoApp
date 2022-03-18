import { Component, OnInit } from '@angular/core';

import {
  ColDef,
  GridOptions,
  Module,
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';

import { dateFormatter, amountFormatter, removeDecimalFormatter, formatDate, dateTimeFormatter } from 'src/app/shared/functions/formatter';
import { Subscription } from 'rxjs';
import { LiquiditySummaryService } from 'src/app/core/services/LiquiditySummary/liquidity-summary.service';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-liquidity-summary',
  templateUrl: './liquidity-summary.component.html',
  styleUrls: ['./liquidity-summary.component.scss']
})
export class LiquiditySummaryComponent implements OnInit {

  subscriptions: Subscription[] = [];
  constructor(private liquiditySummarySvc: LiquiditySummaryService,
              private dataSvc: DataService) { }

  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];

  gridOptions: GridOptions;
  
  /** Filter Pane fields */
  asOfDate: string = null;
  fundHedgings: string[] = null;

  rowData = null;

  columnDefs: ColDef[]

  defaultColDef = {
    resizable: true,
    enableValue: false,
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
      for(let j: number = 0; j < summary[i].fundHedgingAmount.length; j+= 1){
        let FHAmountPair = summary[i].fundHedgingAmount[j]
        row[FHAmountPair.fundHedging] = Number(FHAmountPair.amount);
      }
      parsedData.push(row);
    }

    return parsedData;
  }

  createColumnDefs(row: {date: Date, attr: string, fundHedgingAmount: { fundHedging: string, amount: number}[]} = null){
    this.columnDefs = [
      {
        field: 'date',
        valueFormatter: dateFormatter,
        width: 115,
        cellStyle: params => {
          if(['Current Cash', 'Net Cash', 'Liquidity', 'Cash Post Known Outflows'].includes(params.data?.attr)){
            return { 
              'font-weight' : '600'
            }
          }
          else {
            return null;
          }
        }
      },
      {
        headerName: 'Attribute',
        field: 'attr',
        tooltipField: 'attr',
        cellStyle: params => {
          if(['Current Cash', 'Net Cash', 'Liquidity', 'Cash Post Known Outflows'].includes(params.value)){
            return { 
              'font-weight' : '600'
            }
          }
          else {
            return null;
          }
        }
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
        cellStyle: params => {
          if(['Current Cash', 'Net Cash', 'Liquidity', 'Cash Post Known Outflows'].includes(params.data?.attr)){
            return { 
              'font-weight' : '600'
            }
          }
          else {
            return null;
          }
        }
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

  ngOnInit(): void {
    this.gridOptions = {
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      undoRedoCellEditing: false,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
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
