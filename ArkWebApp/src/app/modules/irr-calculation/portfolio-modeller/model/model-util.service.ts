import { GridApi, RowNode } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { VModel, VPortfolioLocalOverrideModel } from 'src/app/shared/models/IRRCalculationsModel';
import { GridUtilService } from '../grid/grid-util.service';
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';

@Injectable()
export class ModelUtilService {
  modelData: VModel[]
  modelMap = {} //<id, model Object>
  constructor() { }
  initModelMap(modelData: VModel[]): any{
    let modelMap = {};
    for(let i = 0 ; i < modelData.length; i+= 1){
      if(!modelMap.hasOwnProperty(modelData[i].modelID)){
        modelMap[modelData[i].modelID] = modelData[i];
      }
    }
    return modelMap;
  }
  parseFetchedModels(data): VModel[]{
    /* Converts delimeted portfolio rules filter for the grid into Filter object*/
    let modelData: VModel[] = data
    for(let i:number = 0; i < data.length; i+= 1){
      let tempRules: string = String(data[i].rules);
      modelData[i].displayName = Boolean(data[i].isShared) ? `${data[i].modelName}*` : `${data[i].modelName}`
      modelData[i].modelName = data[i].modelName;
      modelData[i].modelID = Number(data[i].modelID);
      modelData[i].modelDesc = data[i].modelDesc;
      modelData[i].isLocal = Boolean(data[i].isLocal);
      modelData[i].isShared = Boolean(data[i].isShared);
      modelData[i].isManual = Boolean(data[i].isManual);
      modelData[i].username = null;
      modelData[i].positionIDs = data[i].positionIDs?.split(',').map(x => parseInt(x))
      modelData[i].rules = [];
      modelData[i].aggregationType = data[i].irrAggrType;
      
      let ruleArr: string[] = tempRules.split('|').join('"').split('~');
      ruleArr.forEach(x => data[i].rules.push(JSON.parse(x)))

      if(ruleArr[0] === "null"){
        modelData[i].rules = null
      }
    }
    return modelData;
  }

  getManualModelPositions(modelID): number[]{
    return this.modelMap[modelID]?.positionIDs;
  }
}