import { Component, OnInit } from '@angular/core';

import {
  ColDef,
  EditableCallbackParams,
  GridOptions,
  IAggFunc,
  IAggFuncParams,
  IsGroupOpenByDefaultParams,
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
import { AddCellRendererComponent } from './add-cell-renderer/add-cell-renderer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttributeCellRendererComponent } from './attribute-cell-renderer/attribute-cell-renderer.component';
import { AccessService } from 'src/app/core/services/Auth/access.service';

@Component({
  selector: 'app-liquidity-summary',
  templateUrl: './liquidity-summary.component.html',
  styleUrls: ['./liquidity-summary.component.scss']
})
export class LiquiditySummaryComponent implements OnInit {

  subscriptions: Subscription[] = [];
  constructor(private liquiditySummarySvc: LiquiditySummaryService,
              private dataSvc: DataService,
              private accessSvc: AccessService,
              private warningMsgPopUp: MatSnackBar,
              public dialog: MatDialog) { }

  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];

  gridOptions: GridOptions;
  
  /** Filter Pane fields */
  asOfDate: string = null;
  fundHedgings: string[] = null;

  rowData = null;
  refData = null;

  columnDefs: ColDef[]
  context
  defaultColDef = {
    resizable: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: false,
    sortable: false,
    filter: true,
    autosize:true,
  }

  actionClickedRowID: number = null;
  isWriteAccess: boolean = false;

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setSelectedRowID(rowID: number){
    this.actionClickedRowID = rowID;
    if(this.actionClickedRowID === null){
      /** 
       *    gridOptions.api (gridApi can be null on initial load, hence adding ? to not call    stopEditing())
       * 
       *  If not adding ?, can give error and wouldn't call getLiquiditySummaryPivoted() in filterBtnApplyState listener
       */
      this.gridOptions.api?.stopEditing(true);
    }
  }

  getSelectedRowID(){
    return this.actionClickedRowID;
  }


  parseFetchedSummary(summary: {date: Date, attr: string, fundHedgingAmount: { fundHedging: string, amount: number}[]}[] = null): any{
    let parsedData = []
    for(let i:number = 0; i < summary.length; i+= 1){
      let row = {};
      row['attr'] = summary[i]['attr'];
      row['date'] = summary[i]['date'];
      row['attrType'] = summary[i]['attrType'];
      row['isManual'] = summary[i]['isManual']
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

      let sum: number = 0;
      let colName: string = params.column.getColId();
      if(params.rowNode.group){

        if (params.rowNode.key === 'Current Cash') {

          this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
            if(rowNode.data?.['attrType'] === 'Current Cash'){
              sum += Number(rowNode.data?.[colName]);
            }
          })
                }
        else if(params.rowNode.key === 'Net Cash') {

          this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
            if(['Current Cash', 'Net Cash'].includes(rowNode.data?.['attrType'])){
              sum += Number(rowNode.data?.[colName]);
            }
          })
        }
        else if(params.rowNode.key === 'Liquidity'){

          this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
            if(['Current Cash', 'Net Cash', 'Liquidity'].includes(rowNode.data?.['attrType'])){
              sum += Number(rowNode.data?.[colName]);
            }
          })
        }
        else if(params.rowNode.key === 'Known Outflows'){

          this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
            if(['Known Outflows'].includes(rowNode.data?.['attrType'])){
              sum += Number(rowNode.data?.[colName]);
            }
          })
        }
        else if(params.rowNode.key === 'Cash Post Known Outflows'){

          this.gridOptions.api.forEachNodeAfterFilter((rowNode, index) => {
            if(['Current Cash', 'Net Cash', 'Liquidity','Known Outflows'].includes(rowNode.data?.['attrType'])){
              sum += Number(rowNode.data?.[colName]);
            }
          })

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
        pinned: 'left'
      },
      {
        headerName: 'Attribute',
        field: 'attr',
        tooltipField: 'attr',
        cellRenderer: 'attributeCellRenderer',
        width: 216,
        pinned: 'left'

      },
      {
        headerName: 'Attribute Type',
        field: 'attrType',
        rowGroup: true,
        hide: true,
        pinned: 'left',
      },
      {
        headerName: 'Is Manual',
        field: 'isManual',
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
        editable: (params: EditableCallbackParams) => {
          return params.node.rowIndex === this.actionClickedRowID;
        },  
      }
      
      this.columnDefs.push(colDef);
    }

    this.columnDefs.push(
    {  
        field: 'action',
        cellRenderer: 'addCellRenderer',
        pinned: 'right',
        width: 117
    })
  }

  fetchLiquiditySummaryRef(){

    this.subscriptions.push(this.liquiditySummarySvc.getLiquiditySummaryRef().subscribe({
      next: data => {
        this.refData = data;
      },
      error: error => {
        console.log("Failed to fetch Liquidity summary Ref data: " + error);
      }
    }))
  }

  fetchLiquiditySummary(){

    this.setSelectedRowID(null);

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
        asOfDate: this.asOfDate,
        refData: this.refData
      }
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      if(result.event === 'Close with success'){

        // Re-fetch attributes & IDs for newly added attributes
        this.fetchLiquiditySummaryRef();

          // Refresh the grid
        this.fetchLiquiditySummary();
      }
    }))
  }
  
  ngOnInit(): void {

    this.isWriteAccess = false;
    for(let i: number = 0; i < this.accessSvc.accessibleTabs.length; i+= 1){
      if(this.accessSvc.accessibleTabs[i].tab === 'Liquidity Summary' && this.accessSvc.accessibleTabs[i].isWrite){
        this.isWriteAccess = true;
        break;
      }        
    }

    this.fetchLiquiditySummaryRef();

    /** Making this component available to child components in Ag-grid */

    this.context = {
      componentParent: this
    }
    this.gridOptions = {
      suppressAggFuncInHeader: true,
      enableRangeSelection: true,
      sideBar: true,
      suppressMenuHide: true,
      singleClickEdit: true,
      undoRedoCellEditing: false,
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      aggFuncs: this.aggFuncs,

            // Expand groups
      isGroupOpenByDefault: (params: IsGroupOpenByDefaultParams) => {
        // return params.rowNode.group && params.key !== 'Known Outflows';
        return true;
      },
      autoGroupColumnDef: {
        pinned: 'left',
        cellRendererParams: {
          suppressCount: true     // Disable row count on group
        }
      },
      frameworkComponents:{
        addCellRenderer: AddCellRendererComponent,
        attributeCellRenderer: AttributeCellRendererComponent
      }
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

  setWarningMsg(message: string, action: string, type: string = 'ark-theme-snackbar-normal'){
    this.warningMsgPopUp.open(message, action, {
      duration: 5000,
      panelClass: [type]
    });
  }
}
