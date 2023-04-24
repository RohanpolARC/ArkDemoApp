import { ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { createColumnDefs, parseFetchedData } from '../../../functions/dynamic.parse';
import { DetailedView, NoRowsCustomMessages } from '../../../models/GeneralModel';

@Component({
  selector: 'app-default-detailed-view-popup',
  templateUrl: './default-detailed-view-popup.component.html',
  styleUrls: ['./default-detailed-view-popup.component.scss']
})
export class DefaultDetailedViewPopupComponent implements OnInit {

  subscriptions: Subscription[] = [];
  request: DetailedView;
  rowData: any[];
  columnDefs: ColDef[] = [];
  gridOptions: GridOptions;
  defaultColDef: ColDef;
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES;

  failureMsg: string = null;
  header: string = 'Detailed View'
  noDataMessage: string = 'No detailed view'
  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';
  detailedViewRequest: any;

  constructor(
    public dialogRef: MatDialogRef<DefaultDetailedViewPopupComponent>,
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
    console.log(this.data)
    if(this.data.detailedViewRequest)
      this.detailedViewRequest = this.data?.['detailedViewRequest'];
    if(this.data.failureMsg)   
      this.failureMsg = this.data?.['failureMsg'];
    if(this.data.header)
      this.header = this.data?.['header'];
    if(this.data.noDataMessage)
      this.noDataMessage = this.data?.['noDataMessage'];
    
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
