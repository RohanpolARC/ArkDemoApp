import { ClientSideRowModelModule, ColDef, GridOptions, GridReadyEvent, Module, ValueFormatterParams } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule, ClipboardModule } from '@ag-grid-enterprise/all-modules';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { createColumnDefs, parseFetchedData } from '../../functions/dynamic.parse';
import { DetailedView } from '../../models/GeneralModel';

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
  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ClipboardModule,ExcelExportModule];

  failureMsg: string = null;
  header: string = 'Detailed View'
  noDataMessage: string = 'No detailed view'

  constructor(
    public dialogRef: MatDialogRef<DetailedViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      detailedViewRequest: any,
      failureMsg: string,
      header: string,
      noDataMessage: string
    },
    private dataSvc: DataService
  ) { }

  fetchDetailedView(request: DetailedView){
    this.subscriptions.push(this.dataSvc.getDetailedView(request).subscribe({
      next: detailedData => {
        this.rowData = detailedData;
      },
      error: error => {
        console.error("Failed to fetch detailed view "+ error);
        this.rowData = [];
      }
    }))
  }

  ngOnInit(): void {
    if(this.data.detailedViewRequest)
      this.request = this.data?.['detailedViewRequest'];
    if(this.data.failureMsg)   
      this.failureMsg = this.data?.['failureMsg'];
    if(this.data.header)
      this.header = this.data?.['header'];
    if(this.data.noDataMessage)
      this.noDataMessage = this.data?.['noDataMessage'];
    
    // If failureMsg is not null, then component displays the failure message directly.
    if(!this.failureMsg){

      this.fetchDetailedView(this.request);

      this.defaultColDef = {
        resizable: true,
        enableValue: true,
        enableRowGroup: true,
        sortable: true,
        filter: true,
      }
      this.gridOptions = {
        columnDefs: this.columnDefs,
        defaultColDef: this.defaultColDef,
        tooltipShowDelay: 0
      }  
    }
  }

  onGridReady(params: GridReadyEvent){
    params.api.closeToolPanel();

    if(!!this.rowData){

      this.columnDefs = createColumnDefs(this.rowData[0].columnValues);
      this.rowData = parseFetchedData(this.rowData);  
      params.api.setColumnDefs(this.columnDefs);

      params.columnApi.autoSizeAllColumns(false);
    }
  }

  onClose(){
    this.dialogRef.close();
  }
}
