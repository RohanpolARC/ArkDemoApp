import { Component, Input, OnInit } from '@angular/core';
import { InvestorGridConfigService } from '../services/investor-grid-config.service';
import { GridApi, Module } from '@ag-grid-community/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { AdaptableApi, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { ComponentReaderService } from '../services/component-reader.service';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { InvestorGridUtilService } from '../services/investor-grid-util.service';

@Component({
  selector: 'app-investor',
  templateUrl: './investor.component.html',
  styleUrls: ['./investor.component.scss'],
  providers:[    
    InvestorGridUtilService,
    InvestorGridConfigService,
  ]
})
export class InvestorComponent implements OnInit {
  @Input() rowData: any[];
  agGridModules: Module[]
  gridApi: GridApi
  adaptableApi: AdaptableApi
  /**
   * Implementing the visitor pattern to read component properties in the service.
    https://stackoverflow.com/a/56975850
   */
  readProperty<T>(prop: string): T {
    if(!this.hasOwnProperty(prop)){
      throw Error(`Property ${prop} does not exist`);
    }
    return this[prop];
  }    
  constructor(public gridConfigSvc: InvestorGridConfigService,
    private capitalActivitySvc: CapitalActivityService,
    private componentReaderSvc: ComponentReaderService) {
      this.componentReaderSvc.registerInvestorComponent(this);
    }
  ngOnInit(): void {

    this.agGridModules = CommonConfig.AG_GRID_MODULES
  }
  onAdaptableReady = (params: AdaptableReadyInfo) => {
    let api: AdaptableApi = params.adaptableApi;
    this.gridApi = params.gridOptions.api;

    this.adaptableApi = api;
    
    api.toolPanelApi.closeAdapTableToolPanel();
    api.columnApi.autosizeAllColumns()

    this.capitalActivitySvc.updateInvestorGridLoaded(true);
  };
}