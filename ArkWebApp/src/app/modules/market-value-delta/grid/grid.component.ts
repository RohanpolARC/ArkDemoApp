import { Component, OnInit } from '@angular/core';
import { ChartToolPanelsDef, ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
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



  rowData = [{
    PositionId                  :   0,
    marketValueLatest           :   5,
    marketValueLast             :   10,
    mvDeltaExisting             :   15,
    MVDeltaNew                  :   0,
    MarketValueIssueLatest      :   0,
    MarketValueIssueLast        :   0,
    MVIssueDeltaExisting        :   0,
    MVIssueDeltaNew             :   0,
    MarkLatest                  :   0,
    MarkLast                    :   0,
    MarkDeltaExisting           :   0,
    MarkDeltaNew                :   0,
    IssuerShortName             :   'string',
    Asset                       :   'string',
    AssetId                     :   0,
    Fund                        :   'string',
    FundHedging                 :   'string',
    PortfolioName               :   'string',
    PortfolioType               :   'string',
    ValuationMethod             :   'string',
    CcyName                     :   'string',
    FundCcy                     :   'string',
    FundAdmin                   :   'string',
    AssetTypeName               :   'string',
    BenchmarkIndex              :   'string',
    MaturityDate                :   new Date(),
    FaceValue                   :   0,
    FaceValueFunded             :   0,
    FaceValueFundedSD           :   0,
    CostValue                   :   0,
    CostValueFunded             :   0,
    CostValueFundedSD           :   0,
    MarketValueFunded           :   0,
    MarketValueFundedSD         :   0,
    FaceValueIssue              :   0,
    FaceValueIssueFunded        :   0,
    FaceValueIssueFundedSD      :   0,
    CostValueIssue              :   0,
    CostValueIssueFunded        :   0,
    CostValueIssueFundedSD      :   0,
    MarketValueIssue            :   0,
    MarketValueIssueFunded      :   0,
    MarketValueIssueFundedSD    :   0
  }]

  
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
