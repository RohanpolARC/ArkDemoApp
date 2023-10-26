import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import {
  AdaptableOptions,
  AdaptableApi
} from '@adaptabletools/adaptable/types';
import {PortfolioHistoryService} from '../../core/services/PortfolioHistory/portfolio-history.service'
import { map } from 'rxjs/operators';
import { CommonConfig } from 'src/app/configs/common-config';
import { ColDef,  GridOptions, Module } from '@ag-grid-community/core';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { PortfolioHistoryGridConfigService } from './service/portfolio-history-grid-config.service';
import { PortfolioHistoryComponentReaderService } from './service/portfolio-history-component-reader.service';
import { PortfolioHistoryBusinessLogicService } from './service/portfolio-history-business-logic.service';

let adapTableApi: AdaptableApi;

@Component({
  selector: 'app-portfolio-history',
  templateUrl: './portfolio-history.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './portfolio-history.component.scss']
})


export class PortfolioHistoryComponent implements OnInit,IPropertyReader {

  rowData: Observable<any[]>;

  modules: Module[] = CommonConfig.AG_GRID_MODULES

  public gridOptions: GridOptions;
  public defaultColDef;

  columnDefs: ColDef[]

  adaptableApi: AdaptableApi;
  public adaptableOptions: AdaptableOptions


  constructor(
    private portfolioHistoryService: PortfolioHistoryService,
    private portfolioHistoryCompReaderService : PortfolioHistoryComponentReaderService,
    private portfolioHistoryGridConfigService : PortfolioHistoryGridConfigService,
    private businessLogicService : PortfolioHistoryBusinessLogicService) {

    this.portfolioHistoryCompReaderService.registerComponent(this)
    this.gridOptions = this.portfolioHistoryGridConfigService.getGridOptions()
    this.defaultColDef = this.portfolioHistoryGridConfigService.getDefaultColDef()
  
  }

  pushReviewed(){
    this.businessLogicService.pushReviewed()
  }

  
  readProperty<T>(prop: string): T {
    if(!this.hasOwnProperty(prop)){
      throw Error(`Property ${prop} does not exist`);
    }
    return this[prop];
  }


  ngOnInit(): void {
    
    this.columnDefs = this.portfolioHistoryGridConfigService.getColumnDefs()
    this.adaptableOptions = this.portfolioHistoryGridConfigService.getAdaptableOptions()

    this.rowData = this.portfolioHistoryService.getPortfolioHistory()
      .pipe(
        map((historyData: any[]) => historyData.map(row => {
          //row['isEdited'] = row['isEdited'] ? 'Yes' : 'No';
          row['isOverride'] = row['isOverride'] ? 'Yes' : 'No';
          return row;
        }))
      )
  }

  ngOnDestroy(): void{}



  onAdaptableReady = ({ adaptableApi, gridOptions }) => {
    adapTableApi = adaptableApi;
    adaptableApi.toolPanelApi.closeAdapTableToolPanel();
    this.adaptableApi = adapTableApi
    this.adaptableApi.columnApi.autosizeAllColumns()
    // use AdaptableApi for runtime access to Adaptable
  };

}