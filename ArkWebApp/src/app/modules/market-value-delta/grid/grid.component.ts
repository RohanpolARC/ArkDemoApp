import { Component, OnInit } from '@angular/core';
import { ChartToolPanelsDef, ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { AdaptableApi, AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { GridConfigService } from '../services/grid-config.service';
import { Observable } from 'rxjs';
import { MarketValueDeltaModel } from 'src/app/shared/models/MarketValueDeltaModel';
import { UtilService } from '../services/util.service';
import { CUSTOM_FORMATTER } from 'src/app/shared/functions/formatter';

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



  rowData = [
    {
      marketValues:"Market Value Last",
      displayValues:10000000000,
      markValues:"Mark Last",
      mark:76.9235,
      maturityDate:'09/29/2024',
      chartingValues:10000000000
    },
    {
      marketValues:"MV Delta Existing",
      displayValues:1000000000,
      markValues:"Mark Delta Existing",
      mark:-0.3815,
      maturityDate:'12/05/2025',
      chartingValues:1000000000
    },
    {
      marketValues:"MV Delta New",
      displayValues:1000000000,
      markValues:"Mark Delta New",
      mark: 0,
      maturityDate:'06/08/2026',
      chartingValues:1000000000
    },
    {
      marketValues:"Market Value Latest",
      displayValues:12000000000,
      markValues:"Mark Latest",
      mark:76.9941,
      maturityDate:'02/15/2027',
      chartingValues:-12000000000
    }
  ]
  adaptableApi: AdaptableApi;


  constructor(
    private gridConfigService: GridConfigService,
    private utilService: UtilService
  ) {
    this.agGridModules = this.gridConfigService.agGridModules,
    this.gridOptions = this.gridConfigService.gridOptions,
    this.adaptableOptions = this.gridConfigService.adaptableOptions
    this.rowData$ = this.utilService.rowData$

  }


  onAdaptableReady(event: AdaptableReadyInfo){
    event.agGridApi.showNoRowsOverlay()
    event.agGridApi.closeToolPanel()
    this.gridConfigService.gridApi = event.agGridApi;
    this.gridConfigService.adaptableApi = event.adaptableApi;
    event.adaptableApi.toolPanelApi.closeAdapTableToolPanel()
  }

  ngOnInit(): void {
  }



}
