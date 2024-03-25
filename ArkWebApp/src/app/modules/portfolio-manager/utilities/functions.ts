import { AdaptableApi } from "@adaptabletools/adaptable-angular-aggrid";
import { CellValueChangedEvent, GridApi } from "@ag-grid-community/core";
import { PortfolioMappingDataService } from "src/app/core/services/PortfolioManager/portfolio-mapping-data.service";

const MANDATORY_FIELDS: string[] = ['wsoPortfolioID', 'fund', 'fundLegalEntity', 'fundHedging', 'fundStrategy', 'fundSMA', 'fundInvestor', 'fundCcy', 'fundAdmin', 'portfolioAUMMethod', 'isCoinvestment', 'excludeFxExposure']

const BOOLEAN_FIELDS: string[] = ['isCoinvestment', 'fundSMA', 'excludeFxExposure']

export { MANDATORY_FIELDS, BOOLEAN_FIELDS }

/**
 * 
 * @param column ColumnName from the grid (i.e. ColDef.field)
 * @param nodeData Individual node data (i.e. params.node.data)
 * @returns if the field is valid or not (based on if it has value or not)
 * 
 * NOTE: This only checks if the field is mandatory & if it has a value. (Doesnt validate the value itself)
 */
export function isFieldValid(column: string, nodeData: any): boolean{
  if(MANDATORY_FIELDS.includes(column)){
    if(BOOLEAN_FIELDS.includes(column) && ![true, false].includes(nodeData?.[column])){
      return false;
    }
    else if(!BOOLEAN_FIELDS.includes(column) && !nodeData?.[column])
      return false;
  }

  if(BOOLEAN_FIELDS.includes(column) && ![true, false].includes(nodeData?.[column]))
    return false;

  return true;
}

/**
 * Returns live Ag-grid data
 * 
 * Uses provided gridApi callback to iterate through live data
 * 
 * @param gridApi Ag-grid api
 * @returns Live grid data
 */
export function getGridData(gridApi: GridApi){
    let liveData: any[] = []
    gridApi.forEachLeafNode(node => {
      liveData.push(node.data)
    })
    return liveData;
}

/**
 * Validing updated `wsoPortfolioID`, `portfolioName`.
 * 
 * Make sure `DataService` has been imported as `dataSvc` in order to get appropriate validation snackbar messages.
 * 
 * @param portfolioMapDataSvc Portfolio Mapping Data Service (Provides `wsoPortfolioRef`, `adaptableApi` in context etc).
 * @param toUpdateGrid Grid on which editing changes are happening on (`Mappings` or `Approval`). i.e. This grid will have data changes applied to it based on the validation result. 
 * @param params Ag-grid params of cell that has been updated.
 */

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

export function getPortfolioTypeParams(){
  return {
    options: this.portfolioMapDataSvc.getPortfolioTypeRef().map(e => e['portfolioTypeName'])
  }
}

export function getUseGIRParams(){
  return {
    options: ["Yes", "No"]
  }
}

/**
 * For mappings grid only.
 * 
 * Finds unique values available for that particular `field`.
 * 
 * Make sure that `PortfolioMappingDataService` has been imported as `portfolioMapDataSvc` in the calling component
 * 
 * @param field Column for which we need to find unique values.
 * @returns all truthy unique values from the supplied ag-grid field.
 */
export function getUniqueParamsFromGrid(field: string){
  return {
    options: [...new Set(getGridData(this.portfolioMapDataSvc.mappingsGridApi).map(e => 
      {
        // // Removes all blank spaces from string values
        // if(typeof e[field] === 'string')
        //   return String(e[field]).replace(/\s/g,'')
        // else return e[field]

        return e[field]
      }
      ))].filter(e => 
      String(e)?.replace(/\s/g,'').length && (e !== null) && (e !== undefined) && (e !== 0)
    ).sort()
  }
}
