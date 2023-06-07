import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, DetailGridInfo, GridApi, GridOptions, GridReadyEvent, ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-wsomark-detail',
  templateUrl: './wsomark-detail.component.html',
  styleUrls: ['./wsomark-detail.component.scss']
})
export class WSOMarkDetailComponent implements ICellRendererAngularComp, OnDestroy {

  params: ICellRendererParams
  masterGridApi: GridApi
  rowId: string
  
  colDefs: ColDef[]
  gridOptions: GridOptions
  rowData: any[]

  constructor() { }
  
  agInit(params: ICellRendererParams){

    this.params = params;
    this.masterGridApi = params.api;
    this.rowId = params.node.id;

    this.colDefs = [
      { field: 'positionID' },
      { field: 'fundHedging' },
      { field: 'portfolioName' },
      { field: 'mark' },
      { field: 'modifiedBy' },
      { field: 'modifiedOn' }
    ]

    this.gridOptions = {
      columnDefs: this.colDefs
    }

    this.rowData = [{ 'positionID': 12345, 'fundHedging': 'CS1FEURL1', 'portfolioName': 'Test portfolio' }]
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }

  onGridReady(event: GridReadyEvent){
    let gridInfo: DetailGridInfo = {
      id: this.rowId,
      api: event.api,
      columnApi: event.columnApi
    } 
    this.masterGridApi.addDetailGridInfo(this.rowId, gridInfo)  
  }

  ngOnDestroy(){
    this.masterGridApi.removeDetailGridInfo(this.rowId);
  }
}