import { AdaptableApi } from "@adaptabletools/adaptable-angular-aggrid";
import { CellValueChangedEvent, GridApi } from "@ag-grid-community/all-modules";
import { PortfolioMappingDataService } from "src/app/core/services/PortfolioManager/portfolio-mapping-data.service";

export function getGridData(gridApi: GridApi){
    let liveData: any[] = []
    gridApi.forEachLeafNode(node => {
      liveData.push(node.data)
    })
    return liveData;
}

export function validateAndUpdate(
  portfolioMapDataSvc: PortfolioMappingDataService,
  toUpdateGrid: 'Mappings' | 'Approval',     // Grid that is being validated
  params: CellValueChangedEvent
){
  
  let nodeData = params.data;
  let val = params.newValue;
  let found: boolean = false

  let wsoPortfolioRef = portfolioMapDataSvc.getWSOPortfolioRef();

  let adaptableApi: AdaptableApi

  if(toUpdateGrid === 'Mappings'){
    adaptableApi = portfolioMapDataSvc.mappingsAdaptableApi
  }
  else if(toUpdateGrid === 'Approval'){
    adaptableApi = portfolioMapDataSvc.approvalAdaptableApi
  }

  let mappingsGridApi: GridApi = portfolioMapDataSvc.mappingsGridApi
  

  if(params.column.getColId() === 'portfolioName'){

    let liveGrid = getGridData(mappingsGridApi);
    let isDuplicate: boolean = false;

    for(let i: number = 0; i < liveGrid.length; i+= 1){
      if((liveGrid[i].mappingID !== params.data.mappingID) && (liveGrid[i]['portfolioName']?.toLowerCase() === params.newValue?.toLowerCase())){
        
        this.dataSvc.setWarningMsg('Duplicate Portfolios not allowed', 'Dismiss', 'ark-theme-snackbar-warning')
        isDuplicate = true
        nodeData['portfolioName'] = params.oldValue
        adaptableApi.gridApi.updateGridData([nodeData])
        break;
      }
    }

    if(!isDuplicate){
      for(let i: number = 0; i < wsoPortfolioRef.length; i+= 1){
        if(wsoPortfolioRef[i].portfolioName.toLowerCase() === val.toLowerCase()){
          nodeData['wsoPortfolioID'] = wsoPortfolioRef[i].wsoPortfolioID
          nodeData['portfolioName'] = wsoPortfolioRef[i].portfolioName
          
          found = true
          break;
        }
      }

      if(!found){
        nodeData['portfolioName'] = params.oldValue
        this.dataSvc.setWarningMsg('Please select Portfolio Name from the list', 'Dismiss', 'ark-theme-snackbar-warning')
      }
      adaptableApi.gridApi.updateGridData([nodeData]);
    }
  }
  else if(params.column.getColId() === 'wsoPortfolioID'){

    let liveGrid = getGridData(mappingsGridApi);
    let isDuplicate: boolean = false;

    for(let i: number = 0; i < liveGrid.length; i+= 1){
      if((liveGrid[i].mappingID !== params.data.mappingID) && (Number(liveGrid[i]['wsoPortfolioID']) === Number(params.newValue))){
        
        this.dataSvc.setWarningMsg('Duplicate Portfolios not allowed', 'Dismiss', 'ark-theme-snackbar-warning')
        isDuplicate = true
        nodeData['wsoPortfolioID'] = Number(params.oldValue)
        adaptableApi.gridApi.updateGridData([nodeData])
        break;
      }
    }

    if(!isDuplicate){
      for(let i: number = 0; i < wsoPortfolioRef.length; i+= 1){
        if(Number(wsoPortfolioRef[i].wsoPortfolioID) === Number(val)){
          nodeData['wsoPortfolioID'] = Number(wsoPortfolioRef[i].wsoPortfolioID)
          nodeData['portfolioName'] = wsoPortfolioRef[i].portfolioName
          
          found = true
          break;
        }
      }

      if(!found){
        nodeData['wsoPortfolioID'] = Number(params.oldValue)
        this.dataSvc.setWarningMsg('Please select Portfolio ID from the list', 'Dismiss', 'ark-theme-snackbar-warning')
      }
      adaptableApi.gridApi.updateGridData([nodeData]);
    }
  }
}


export function getPortfolioIDParams(){
  return {
    options: this.portfolioMapDataSvc.getWSOPortfolioRef().map(e => e['wsoPortfolioID'])
  }
}

export function getPortfolioNameParams(){
  return {
    options: this.portfolioMapDataSvc.getWSOPortfolioRef().map(e => e['portfolioName'])
  }
}

export function getUniqueParamsFromGrid(field: string){
  return {
    options: [...new Set(getGridData(this.portfolioMapDataSvc.mappingsGridApi).map(e => 
      {
        if(typeof e[field] === 'string')
          return String(e[field]).replace(/\s/g,'')
        else return e[field]
      }
      ))].filter(e => 
      String(e)?.replace(/\s/g,'').length && (e !== null) && (e !== undefined) && (e !== 0)
    ).sort()
  }
}
