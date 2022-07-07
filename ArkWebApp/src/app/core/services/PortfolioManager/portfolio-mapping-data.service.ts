import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { GridApi } from '@ag-grid-community/all-modules';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PortfolioMappingDataService {

  private wsoPortfolioRef: any[] = null
  private mappings: any[] = null

  mappingsAdaptableApi: AdaptableApi
  mappingsGridApi: GridApi
  
  approvalAdaptableApi: AdaptableApi
  approvalGridApi: GridApi

  constructor() { }

  setWSOPortfolioRef(data: any[]){
    this.wsoPortfolioRef = data
  }

  getWSOPortfolioRef(){
    return this.wsoPortfolioRef
  }
  
  setMappings(data: any[]){
    this.mappings = data
  }

  getMappings(){
    return this.mappings;
  }

  
  
}
