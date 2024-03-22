import { Component, OnInit } from '@angular/core';
import { GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { GridConfigService } from '../services/grid-config.service';
import { Observable } from 'rxjs';
import { MarketValueDeltaModel } from 'src/app/shared/models/MarketValueDeltaModel';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss','./grid.component.scss']
})
export class GridComponent implements OnInit {

  agGridModules: Module[]
  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions
  rowData$ : Observable<MarketValueDeltaModel[]>

  constructor(
    private gridConfigService: GridConfigService,
    private utilService: UtilService
  ) { 
    this.agGridModules = this.gridConfigService.agGridModules,
    this.gridOptions = this.gridConfigService.gridOptions,
    this.adaptableOptions = this.gridConfigService.adaptableOptions
    this.rowData$ = this.utilService.rowData$
  }

  onGridReady(params: GridReadyEvent){
    params.api.closeToolPanel()
    this.gridConfigService.gridApi = params.api;   
  }

  onAdaptableReady({ adaptableApi, gridOptions }){
    this.gridConfigService.adaptableApi = adaptableApi;
    adaptableApi.toolPanelApi.closeAdapTableToolPanel()
  }

  ngOnInit(): void {
  }

}
