import { Component, OnInit } from '@angular/core';
import { GridConfigService } from '../services/grid-config.service';
import { UtilService } from '../services/util.service';
import { AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { Observable} from 'rxjs';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  gridOptions: GridOptions
  adaptableOptions: AdaptableOptions
  modules: Module[] = CommonConfig.AG_GRID_MODULES
  rowData$: Observable<any[]>
  constructor(private gridConfigSvc: GridConfigService,
    private utilSvc: UtilService) {
      
      this.gridOptions = this.gridConfigSvc.gridOptions;
      this.adaptableOptions = this.gridConfigSvc.adaptableOptions;  
      
      this.rowData$ = this.utilSvc.rowData$;
    }

  ngOnInit(): void { 
    
  }

  onGridReady(params: GridReadyEvent){
    params.api.showNoRowsOverlay()
    this.gridConfigSvc.gridApi = params.api
    params.api.closeToolPanel();
  }

  onAdaptableReady(params: AdaptableReadyInfo){
    this.gridConfigSvc.adaptableApi = params.adaptableApi
  }

}
