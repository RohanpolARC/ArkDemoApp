import { Injectable } from '@angular/core';
import { VModel } from 'src/app/shared/models/IRRCalculationsModel';

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
      modelData[i].displayName = Boolean(data[i].isShared=="Yes") ? `${data[i].modelName}*` : `${data[i].modelName}`
      modelData[i].modelName = data[i].modelName;
      modelData[i].modelID = Number(data[i].modelID);
      modelData[i].modelDesc = data[i].modelDesc;
      modelData[i].isLocal = data[i].isLocal;
      modelData[i].isShared = data[i].isShared;
      modelData[i].autoManualOption = data[i].autoManualOption;
      modelData[i].latestWSOStatic = Boolean(data[i].latestWSOStatic);
      modelData[i].username = null;
      modelData[i].positionIDs = data[i].positionIDs?.split(',').map(x => parseInt(x))
      modelData[i].rules = [];
      modelData[i].rulesStr = '';
      modelData[i].aggregationType = data[i].irrAggrType;
      modelData[i].fundCurrency = data[i].fundCurrency;
      modelData[i].feePreset = data[i].feePreset;
      modelData[i].createdBy = data[i].createdBy;
      modelData[i].createdOn = data[i].createdOn;
      modelData[i].modifiedOn = data[i].modifiedOn;
      
      let ruleArr: string[] = tempRules.split('|').join('"').split('~');
      ruleArr.forEach(x => data[i].rules.push(JSON.parse(x)))

      if(ruleArr[0] === "null"){
        modelData[i].rules = null
      }


      modelData[i].rules?.forEach(rule => {
        modelData[i].rulesStr += "Column: "+rule.ColumnId+", "+rule.Predicate.PredicateId+": "+rule.Predicate.Inputs+", "
      })
      modelData[i].rulesStr = modelData[i].rulesStr?.slice(0, -2) // Remove last delimeter
      
    }
    return modelData;
  }

  getManualModelPositions(modelID): number[]{
    return this.modelMap[modelID]?.positionIDs;
  }
}