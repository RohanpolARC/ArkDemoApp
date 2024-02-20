import { AdaptableApi, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { GridApi, Module } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { InvestmentGridConfigService } from '../services/investment-grid-config.service';
import { ComponentReaderService } from '../services/component-reader.service';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { CommonConfig } from 'src/app/configs/common-config';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { InvestmentGridUtilService } from '../services/investment-grid-util.service';

@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.scss'],
  // Grid Config and Util Services injected on component level so that config, services can be added to grid on every ngOnInit() and unsubscribe the subscriptions in services on component ngOnDestroy()
  providers: [
    InvestmentGridUtilService,
    InvestmentGridConfigService,
  ]
})

export class InvestmentComponent implements OnInit, IPropertyReader {
  @Input() rowData: any[]
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
  constructor(public gridConfigSvc: InvestmentGridConfigService,
    private capitalActivitySvc: CapitalActivityService,
    private componentReaderSvc: ComponentReaderService) {
      this.componentReaderSvc.registerInvestmentComponent(this)
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

    this.capitalActivitySvc.updateInvestmentGridLoaded(true);
  };
}
