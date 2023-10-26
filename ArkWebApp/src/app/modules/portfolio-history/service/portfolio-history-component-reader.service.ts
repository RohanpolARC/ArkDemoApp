import {  AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import {  GridOptions } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';

@Injectable()
export class PortfolioHistoryComponentReaderService {

  constructor() { }

  component: IPropertyReader
  registerComponent(comp: IPropertyReader){
    this.component = comp;
  }

  getAdaptableApi(): AdaptableApi {
    return this.component.readProperty<AdaptableApi>('adaptableApi');
  } 

  getGridOptions() : GridOptions {
    return  this.component.readProperty<GridOptions>('gridOptions');
  }

}
