import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, OnInit, Input } from '@angular/core';
import { NetReturnsSummaryGridService } from '../services/net-returns-summary-grid.service';
import { CommonConfig } from 'src/app/configs/common-config';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-net-returns-summary',
  templateUrl: './net-returns-summary.component.html',
  styleUrls: ['./net-returns-summary.component.scss']
})
export class NetReturnsSummaryComponent implements OnInit {

  @Input() summary 

  filterApply$: Observable<boolean> = this.netReturnsSummaryGridSvc.filterApply$

  gridOptions: GridOptions = this.netReturnsSummaryGridSvc.getGridOptions()
  adaptableOptions: AdaptableOptions = this.netReturnsSummaryGridSvc.getAdaptableOptions()
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES

  constructor(
    private netReturnsSummaryGridSvc: NetReturnsSummaryGridService
  ) { }

  ngOnInit(): void {
  }

  onGridReady(params: GridReadyEvent){
    params.api.showNoRowsOverlay()
    this.netReturnsSummaryGridSvc.gridApi = params.api
  }

  onAdaptableReady = ({ adaptableApi: AdaptableApi, gridOptions: GridOptions }) => {
    this.netReturnsSummaryGridSvc.adaptableApi = AdaptableApi
  }

}
