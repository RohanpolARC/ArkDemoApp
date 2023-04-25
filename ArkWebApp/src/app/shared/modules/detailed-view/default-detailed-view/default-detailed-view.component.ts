import { ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit,  Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { DataService } from 'src/app/core/services/data.service';
import { createColumnDefs, parseFetchedData } from '../../../functions/dynamic.parse';
import { DetailedView, NoRowsCustomMessages } from '../../../models/GeneralModel';
import { NoRowsOverlayComponent } from 'src/app/shared/components/no-rows-overlay/no-rows-overlay.component';

@Component({
  selector: 'app-default-detailed-view',
  templateUrl: './default-detailed-view.component.html',
  styleUrls: ['./default-detailed-view.component.scss']
})
export class DefaultDetailedViewComponent implements OnInit {

  @Input() detailedViewRequest:any
  @Input() failureMsg:string = null
  @Input() header:string ='Detailed View'
  @Input() noDataMessage:string = 'No detailed view'

  subscriptions: Subscription[] = [];
  request: DetailedView;
  rowData: any[];
  columnDefs: ColDef[] = [];
  gridOptions: GridOptions;
  defaultColDef: ColDef;
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES;

  noRowsToDisplayMsg: NoRowsCustomMessages = 'No data found.';

  constructor(

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
    this.request = this.detailedViewRequest

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
        tooltipShowDelay: 0,
        noRowsOverlayComponent: NoRowsOverlayComponent,
        noRowsOverlayComponentParams: {
          noRowsMessageFunc: () => this.noRowsToDisplayMsg,
        },
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
