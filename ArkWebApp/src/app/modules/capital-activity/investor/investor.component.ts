import { Component, Input, OnInit } from '@angular/core';
import { InvestorGridConfigService } from '../services/investor-grid-config.service';
import { GridApi, Module } from '@ag-grid-community/core';
import { CommonConfig } from 'src/app/configs/common-config';
import { AdaptableApi, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { ComponentReaderService } from '../services/component-reader.service';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { ConfigurationService } from '../services/configuration.service';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { InvestorGridUtilService } from '../services/investor-grid-util.service';

@Component({
  selector: 'app-investor',
  templateUrl: './investor.component.html',
  styleUrls: ['./investor.component.scss'],
  // Grid Config and Util Services injected on component level so that config, services can be added to grid on every ngOnInit() and unsubscribe the subscriptions in services on component ngOnDestroy()
  providers: [
    InvestorGridUtilService,
    InvestorGridConfigService,
  ]
})
export class InvestorComponent implements OnInit {
  @Input() rowData: any[];
  agGridModules: Module[]
  gridApi: GridApi
  adaptableApi: AdaptableApi
  subscriptions: Subscription[] = []
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
    private componentReaderSvc: ComponentReaderService,
    public configSvc:ConfigurationService) {
      this.componentReaderSvc.registerInvestorComponent(this);
    }
  ngOnInit(): void {

    this.agGridModules = CommonConfig.AG_GRID_MODULES
    this.subscriptions.push(this.configSvc.capitalActivityConfig$.subscribe(
      (val) => {
        this.adaptableApi?.gridApi?.refreshCells(this.adaptableApi.gridApi.getAllRowNodes(),['Edit'])
      })
    )
  }
  onAdaptableReady = (params: AdaptableReadyInfo) => {
    let api: AdaptableApi = params.adaptableApi;
    this.gridApi = params.gridOptions.api;

    this.adaptableApi = api;
    
    api.toolPanelApi.closeAdapTableToolPanel();
    api.columnApi.autosizeAllColumns()

    this.capitalActivitySvc.updateInvestorGridLoaded(true);    
  };

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}