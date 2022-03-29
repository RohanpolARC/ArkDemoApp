import { ClientSideRowModelModule, ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { amountFormatter, dateFormatter } from '../../functions/formatter';
import { DetailedView } from '../../models/DetailedViewModel';

@Component({
  selector: 'app-detailed-view',
  templateUrl: './detailed-view.component.html',
  styleUrls: ['./detailed-view.component.scss']
})
export class DetailedViewComponent implements OnInit {

  subscriptions: Subscription[] = [];
  request: DetailedView;
  rowData: any[];
  columnDefs: ColDef[] = [];
  gridOptions: GridOptions;
  defaultColDef: ColDef;
  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];

  constructor(
    public dialogRef: MatDialogRef<DetailedViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private dataSvc: DataService
  ) { }

  parseFetchedData(data: {
      columnValues: {
        column: string,
        value: string
      }[]
    }[]){

      let rowData = []
      for(let i: number = 0; i < data?.length; i+= 1){
        let row = {};
        for(let j: number = 0; j < data[i]?.columnValues.length; j+= 1){
          row[data[i]?.columnValues[j].column] = isNaN(Number(data[i]?.columnValues[j].value)) ? data[i]?.columnValues[j].value : Number(data[i]?.columnValues[j].value);
        }
        rowData.push(row);
      }

    return rowData;
  }

  fetchDetailedView(request: DetailedView){
    this.subscriptions.push(this.dataSvc.getDetailedView(request).subscribe({
      next: detailedData => {
        this.rowData = detailedData;
      },
      error: error => {
        console.error("Failed to fetch detailed view "+ error);
      }
    }))
  }

  createColumnDefs(row: {column: string, value: string}[]){

    this.columnDefs = []

    for(let i:number = 0; i < row.length; i+= 1){
      let col: string = row[i].column;
      let colDef: ColDef = {
        field: col,
      }
      if(col.toLowerCase().includes('date')){
        colDef = {
          field: col,
          valueFormatter: dateFormatter
        }
      }
      else if(!isNaN(parseFloat(row[i].value))){
        colDef = {
          field: col,
          valueFormatter: amountFormatter
        }
      }

      this.columnDefs.push(colDef);
    }
  }

  ngOnInit(): void {
    this.request = this.data?.['detailedViewRequest'];
    this.fetchDetailedView(this.request);

    this.defaultColDef = {
      enableValue: true,
      enableRowGroup: true      
    }
    this.gridOptions = {
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      
    }
  }

  onGridReady(params: GridReadyEvent){
    params.api.closeToolPanel();

    if(!!this.rowData){
      this.createColumnDefs(this.rowData[0].columnValues);
      this.rowData = this.parseFetchedData(this.rowData);  
      this.gridOptions.api.setColumnDefs(this.columnDefs);

      this.gridOptions.columnApi.autoSizeAllColumns(false);
    }
  }

  onClose(){
    this.dialogRef.close();
  }
}
