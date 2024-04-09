import { AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { PoscashGridConfigService } from '../services/poscash-grid-config.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})

export class GridComponent implements OnInit {

  @Input() gridOptions            : GridOptions
  @Input() adaptableOptions       : AdaptableOptions

  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES
  rowData$: Observable<any[]> = this.gridUtilSvc.rowData$
  cashflowType$: Observable<string> = this.gridUtilSvc.changeInCashFlowTypeFilter$ 
  
  constructor(
    private gridUtilSvc: UtilService,
    private poscashGridConfigSvc: PoscashGridConfigService,

  ) { }

  ngOnInit(): void {        
    this.poscashGridConfigSvc.init()
  }

  onAdaptableReady = (params: AdaptableReadyInfo) => {

    this.poscashGridConfigSvc.adaptableApi = params.adaptableApi
    this.poscashGridConfigSvc.adaptableApi.toolPanelApi.closeAdapTableToolPanel()
    this.poscashGridConfigSvc.adaptableApi.columnApi.autosizeAllColumns()
  };

  onGridReady(params: GridReadyEvent){
    this.poscashGridConfigSvc.gridApi = params.api
    params.api.showNoRowsOverlay()
    params.api.closeToolPanel();
  }
}