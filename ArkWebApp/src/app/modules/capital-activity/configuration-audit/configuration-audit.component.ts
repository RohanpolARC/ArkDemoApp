import { AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { ConfigurationGridService } from '../services/configuration-grid.service';

@Component({
  selector: 'app-configuration-audit',
  templateUrl: './configuration-audit.component.html',
  styleUrls: ['./configuration-audit.component.scss']
})
export class ConfigurationAuditComponent implements OnInit {

  @Input() columnDefs             : ColDef[]
  @Input() gridOptions            : GridOptions
  @Input() adaptableOptions       : AdaptableOptions

  agGridModules                   : Module[] = CommonConfig.AG_GRID_MODULES;


  constructor(
    private configurationGridSvc: ConfigurationGridService
  ) { }

  ngOnInit(): void {
    this.configurationGridSvc.updateFirstLoad(true) // This will fetch and set config audit grid data.
  }

  onGridReady(params: GridReadyEvent){
    this.configurationGridSvc.gridApi = params.api
    params.api.closeToolPanel();
  }

  onAdaptableReady(params: AdaptableReadyInfo){
    this.configurationGridSvc.adaptableApi = params.adaptableApi
  }

}
