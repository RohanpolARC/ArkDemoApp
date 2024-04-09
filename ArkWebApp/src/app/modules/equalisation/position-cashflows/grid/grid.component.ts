import { AdaptableApi, AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { UtilService } from '../services/util.service';
import { EqPoscashGridConfigService } from '../services/eq-poscash-grid-config.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit {

  @Input() gridOptions            : GridOptions
  @Input() adaptableOptions       : AdaptableOptions

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  rowData$: Observable<any[]> = this.gridUtilSvc.rowData$
  
  constructor(
    private gridUtilSvc: UtilService,
    private eqPoscashGridConfigSvc: EqPoscashGridConfigService,

  ) { }

  ngOnInit(): void {
  }

  onAdaptableReady(params: AdaptableReadyInfo){
    this.eqPoscashGridConfigSvc.adaptableApi = params.adaptableApi;
    this.eqPoscashGridConfigSvc.adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.eqPoscashGridConfigSvc.adaptableApi.columnApi.autosizeAllColumns();
  }

  onGridReady(params: GridReadyEvent){
    this.eqPoscashGridConfigSvc.gridApi = params.api
    params.api.showNoRowsOverlay()
    params.api.closeToolPanel();
  }
}
