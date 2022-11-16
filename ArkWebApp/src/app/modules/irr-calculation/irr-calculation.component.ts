import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { CashFlowParams, IRRCalcParams, MonthlyReturnsCalcParams, PerfFeesCalcParams } from 'src/app/shared/models/IRRCalculationsModel';
import { LoadStatusType } from './portfolio-modeller/portfolio-modeller.component';

type tabset = {
  displayName: string,
  status: string,    // Loaded, Loading, Failed
  resultType: string,    //'IRR' | 'MonthlyReturn' | 'PortfolioModeller'
  calcParams?: any//IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesCalcParams
}[]

export type ParentTabType = {
  parentDisplayName: string,
  parentActualName:string,
  status: LoadStatusType,
  tabset:tabset
}

@Component({
  selector: 'app-irr-calculation',
  templateUrl: './irr-calculation.component.html',
  styleUrls: ['./irr-calculation.component.scss']
})
export class IrrCalculationComponent implements OnInit {

  asOfDate: string
  constructor(
    private dataSvc: DataService,
    public irrCalcSvc: IRRCalcService 
  ) { }

  subscriptions: Subscription[] = []
  selected = new FormControl(0);
  calcParamsMap = {} //<model name, IRRCalcParams>
  cashflowLoadStatus: LoadStatusType = 'Loading';

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
    this.subscriptions.push(this.irrCalcSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.irrCalcSvc.parentTabs = [{
          parentDisplayName: 'Portfolio Modeller',
          parentActualName: 'Portfolio Modeller',
          status: 'Loaded',
          tabset: [{
          displayName: 'Portfolio Modeller',
          status: 'Loaded',
          resultType: 'PortfolioModeller'
        }]
        }]
      }
    }))

  }
  statusReceived(status: LoadStatusType, index: number){
    if(index >= 1){
      this.irrCalcSvc.parentTabs[index].status = status 
    }

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
        tabType: string, 
        calcParams: IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesCalcParams | CashFlowParams}[]
      }
    ){
      let p = params.tabs

    let newTabSet:tabset =[]
    p.forEach((tabData)=>{

      newTabSet.push({
        displayName: tabData.tabName,
        status: 'Loading',
        resultType: tabData.tabType,
        calcParams: tabData.calcParams
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
      tabset: newTabSet
    }
    this.irrCalcSvc.parentTabs.push(newParentTab);    
    this.selected.setValue(this.irrCalcSvc.parentTabs.indexOf(newParentTab))

  }

  cashflowLoadStatusReceived(status: LoadStatusType){
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

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
