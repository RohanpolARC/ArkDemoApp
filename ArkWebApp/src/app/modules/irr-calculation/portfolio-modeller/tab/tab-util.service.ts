import { Injectable } from '@angular/core';
import { ModelUtilService } from '../model/model-util.service';
import { ComponentReaderService } from '../../service/component-reader.service';
import { IRRCalcParams, MonthlyReturnsCalcParams, PerfFeesCalcParams, TabContext, TabType } from 'src/app/shared/models/IRRCalculationsModel';
import { FormControl } from '@angular/forms';

@Injectable()
export class TabUtilService {

  constructor(private modelSvc: ModelUtilService,
    private compReaderSvc: ComponentReaderService) { }

  createNewTabGroup(runID: string, context: string[] = ['SaveRunIRR'], contextData: TabContext){
    let calcParamsData = []

    //Set calculation param configs and open all the tabs first
    context.forEach(e => {
        switch (e) {

          case 'SaveRunPFees':
            calcParamsData.push({ runID: runID, type: 'Performance Fees', feePreset: contextData?.feePreset })
            break;
          case 'SaveRunMReturns':
            calcParamsData.push({ runID: runID, type: 'Monthly Returns', baseMeasure: contextData?.baseMeasure })
            break;  
          case 'SaveRunIRR':
            calcParamsData.push({ runID: runID, type: 'IRR', aggrStr: contextData?.aggrStr, mapGroupCols: contextData?.mapGroupCols, curveRateDelta: contextData.curveRateDelta, latestWSOStatic: contextData?.latestWSOStatic })
            break;
          default:
            break;
        }
    });

    // This will create new tab configs and will emit the config for new tab config to IRR Calculation component. 
    this.multiCalculationStaging(this.modelSvc.modelMap[this.compReaderSvc.selectedModelID()]?.modelName, calcParamsData)
  }

  multiCalculationStaging(parentDisplayName, calcStagingData: TabContext[]) {
    let calcParamsEmitterData = []
    
    for(let i: number = 0; i < calcStagingData?.length; i+= 1){
      calcParamsEmitterData.push(this.calculationStaging(calcStagingData[i]))
    }

    this.compReaderSvc.calcParamsEmitter().emit({
      parentDisplayName: parentDisplayName,
      tabs: calcParamsEmitterData
    })
  }

  calculationStaging(p: TabContext): {
    calcParams: MonthlyReturnsCalcParams | PerfFeesCalcParams | IRRCalcParams,
    tabName: string,
    tabType: TabType
  }{

    let selectedPositionIDs: number[] = this.compReaderSvc.selectedPositionIDs();
    let selectedModelID: number = this.compReaderSvc.selectedModelID();
    let isLocal: FormControl = this.compReaderSvc.isLocal();
    let asOfDate: string = this.compReaderSvc.asOfDate();

    let calcParams: MonthlyReturnsCalcParams | PerfFeesCalcParams | IRRCalcParams

    let tabName: string, tabType: TabType
    
    if(p.type === 'Monthly Returns'){
      
      let cp = <MonthlyReturnsCalcParams> {};
      cp.baseMeasure = p.baseMeasure;
      let positionIDsSTR: string = ''
      this.compReaderSvc.selectedPositionIDs().forEach(posID => {
        positionIDsSTR += String(posID) + ','
      })
      positionIDsSTR = positionIDsSTR.slice(0, -1) // Remove last delimeter

      cp.positionIDs = positionIDsSTR
      calcParams = cp as MonthlyReturnsCalcParams
    }
    else if(p.type === 'Performance Fees'){
      
      let cp = <PerfFeesCalcParams> {};
      cp.positionIDs = selectedPositionIDs;
      cp.feePreset = p.feePreset;
      cp.modelID = selectedModelID,

      calcParams = cp as PerfFeesCalcParams
    }
    else if(p.type === 'IRR'){
      
      let cp = <IRRCalcParams>{};
      cp.positionIDs = selectedPositionIDs;
      cp.irrAggrType = this.modelSvc.modelMap[selectedModelID]?.irrAggrType;
      cp.modelID = isLocal.value ? selectedModelID : null,
      cp.aggrStr = p.aggrStr;
      cp.mapGroupCols = p.mapGroupCols;
      cp.curveRateDelta = p.curveRateDelta;
      cp.latestWSOStatic = p.latestWSOStatic;

      calcParams = cp as IRRCalcParams
    }


    calcParams.runID = p.runID;
    calcParams.asOfDate = asOfDate;
    calcParams.modelName = this.modelSvc.modelMap[selectedModelID]?.modelName;

    tabName = p.type
    tabType = p.type;
    let tabData = {calcParams: calcParams, tabName: tabName, tabType: tabType}
    return tabData
  }
}