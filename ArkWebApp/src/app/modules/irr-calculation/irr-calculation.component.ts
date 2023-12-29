import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { CashFlowParams, IRRCalcParams, LoadStatus, MonthlyReturnsCalcParams, ParentTabType, PerfFeesCalcParams, ResultTab, TabType } from 'src/app/shared/models/IRRCalculationsModel';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';
import { ComponentReaderService } from './service/component-reader.service';
import { TabUtilService } from './portfolio-modeller/tab/tab-util.service';
import { ModelUtilService } from './portfolio-modeller/model/model-util.service';
import { GridUtilService } from './portfolio-modeller/grid/grid-util.service';
import { PortfolioModellerService } from './service/portfolio-modeller.service';
import { FeeCalculationService } from 'src/app/core/services/FeeCalculation/fee-calculation.service';
import { GridConfigService } from './portfolio-modeller/grid/grid-config.service';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-irr-calculation',
  templateUrl: './irr-calculation.component.html',
  styleUrls: ['./irr-calculation.component.scss'],
  providers: [
    FeeCalculationService,
    PortfolioModellerService,
    GridUtilService,
    GridConfigService,
    ModelUtilService,
    TabUtilService,
    ComponentReaderService
  ]
})
export class IrrCalculationComponent implements OnInit {

  asOfDate: string
  constructor(
    private dataSvc: DataService,
    public irrCalcSvc: IRRCalcService ,
    private filterSvc: GeneralFilterService,
    private portfolioModellerService: PortfolioModellerService
  ) { }

  subscriptions: Subscription[] = []
  selected = new FormControl(0);
  calcParamsMap = {} //<model name, IRRCalcParams>
  cashflowLoadStatus: LoadStatus = 'Loading';

  removeTab(params:{index?: number,pDisplayName:string}) {
    if(params.index){
      this.irrCalcSvc.parentTabs.splice(params.index, 1);
    }else{
      let index = this.irrCalcSvc.parentTabs.findIndex(parenttab => params.pDisplayName === parenttab.parentDisplayName)
      this.irrCalcSvc.parentTabs.splice(index, 1);
    }
    delete this.calcParamsMap[params.pDisplayName]

  }

  ngOnInit(): void {
    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe(data=>{
      if(data){
        if(data.id === 221){
          this.irrCalcSvc.changeSearchDate(getMomentDateStr(data.value))
        }
      }
    }))

    this.subscriptions.push(this.irrCalcSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.irrCalcSvc.parentTabs = []

      }
    }))

  }
  statusReceived(status: LoadStatus, index: number){
    this.irrCalcSvc.parentTabs[index].status = status 

    // Update parent tabs in IRR Service
    this.irrCalcSvc.parentTabs = this.irrCalcSvc.parentTabs;
  }

  /**
   * 
   * @param tabType ${Model Name} / Monthly Returns / IRR 
   * @param params IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesParams
   */
  calcParamsReceived(
    params: {
      parentDisplayName: string,
      tabs: {
        tabName: string, 
        tabType: TabType, 
        calcParams: IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesCalcParams | CashFlowParams}[]
      }
    ){
      let p = params.tabs

    let newTabSet:ResultTab[] =[]
    p.forEach((tabData)=>{

      newTabSet.push({
        displayName: tabData.tabName,
        status: 'Loading',
        resultType: tabData.tabType,
        calcParams: tabData.calcParams,
      })
    })

    let cnt = this.irrCalcSvc.parentTabs.filter(pt=>pt.parentActualName===params.parentDisplayName).length
   
    if(!(p.length === 1 && p[0].tabType === 'Monthly Returns')){
      newTabSet.push({
        displayName: 'Cashflows',
        status: 'Loading',
        resultType: 'Cashflows',
        calcParams: { runID: p[0].calcParams.runID }
      })
    }


   

    let parentDisplayName = (cnt !== 0) ? `${params.parentDisplayName} ${cnt + 1}`: `${params.parentDisplayName}`

    let newParentTab: ParentTabType = {
      parentDisplayName: parentDisplayName ,
      parentActualName: params.parentDisplayName,
      status : 'Loading',
      tabset: newTabSet,
      index:this.irrCalcSvc.parentTabs.length+1
    }
    this.irrCalcSvc.parentTabs.push(newParentTab);    
    this.selected.setValue(this.irrCalcSvc.parentTabs.indexOf(newParentTab)+1)

  }

  cashflowLoadStatusReceived(status: LoadStatus){
    this.cashflowLoadStatus = status;
  }

  reRun(index: number){
    if(index >= 1){
      let displayName: string = this.irrCalcSvc.parentTabs[index][0].displayName 
      let params = this.calcParamsMap[displayName]
      this.calcParamsMap[displayName] = null;
      this.calcParamsMap[displayName] = params
    }
  }

  onParentTabChanged(event:MatTabChangeEvent){
    this.portfolioModellerService.updateTabGroupSelected(event.index,null,"Parent")
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
