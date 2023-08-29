import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { Grid, GridApi } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';

@Injectable()
export class ComponentReaderService {
  investorComponent: IPropertyReader
  investmentComponent: IPropertyReader
  constructor() { }

  registerInvestorComponent(comp: IPropertyReader){
    this.investorComponent = comp;
  }
  registerInvestmentComponent(comp: IPropertyReader){
    this.investmentComponent = comp;
  }

  investorAdaptableApi(): AdaptableApi {
    return this.investorComponent.readProperty<AdaptableApi>('adaptableApi');
  } 
  investmentAdaptableApi(): AdaptableApi {
    return this.investmentComponent.readProperty<AdaptableApi>('adaptableApi');
  }
  investorGridApi(): GridApi {
    return this.investorComponent.readProperty<GridApi>('gridApi');
  }
  investmentGridApi(): GridApi {
    return this.investmentComponent.readProperty<GridApi>('gridApi');
  }
}