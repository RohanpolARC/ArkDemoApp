import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { IRRCalcParams, MonthlyReturnsCalcParams, PerfFeesCalcParams } from 'src/app/shared/models/IRRCalculationsModel';
import { LoadStatusType } from './portfolio-modeller/portfolio-modeller.component';

type tabset = {
  displayName: string,
  status: string,    // Loaded, Loading, Failed
  resultType: string,    //'IRR' | 'MonthlyReturn' | 'PortfolioModeller'
  calcParams?: any//IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesCalcParams
}[]

@Component({
  selector: 'app-irr-calculation',
  templateUrl: './irr-calculation.component.html',
  styleUrls: ['./irr-calculation.component.scss']
})
export class IrrCalculationComponent implements OnInit {

  asOfDate: string
  constructor(
    private dataSvc: DataService,
    private irrCalcSvc: IRRCalcService 
  ) { }

  subscriptions: Subscription[] = []
  parenttabs : {
    parentDisplayName: string,
    parentActualName:string,
    status:string,
    tabset:tabset
  }[]= [{
    parentDisplayName: 'Portfolio Modeller',
    parentActualName: 'Portfolio Modeller',
    status: 'Loaded',
    tabset: [{
    displayName: 'Portfolio Modeller',
    status: 'Loaded',
    resultType: 'PortfolioModeller'
  }]
  }];



  selected = new FormControl(0);
  calcParamsMap = {} //<model name, IRRCalcParams>
  cashflowLoadStatus: LoadStatusType = 'Loading';

  removeTab(params:{index?: number,pDisplayName:string}) {
    if(params.index){
      this.parenttabs.splice(params.index, 1);
    }else{
      let index = this.parenttabs.findIndex(parenttab=>params.pDisplayName==parenttab.parentDisplayName)
      this.parenttabs.splice(index, 1);
    }
    delete this.calcParamsMap[params.pDisplayName]

  }

  ngOnInit(): void {
    this.subscriptions.push(this.irrCalcSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.parenttabs = [{
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
  statusReceived(status: string, index: number){
    if(index >= 1){
      this.parenttabs[index].status = status 
    }
  }

  /**
   * 
   * @param tabType ${Model Name} / Monthly Returns / IRR 
   * @param params IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesParams
   */
  calcParamsReceived(
    params: {
      parentDisplayName: string,
      tabs: {tabName: string, tabType: string, calcParams: IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesCalcParams}[]
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

    newTabSet.push({
      displayName:'Cashflows',
      status: 'Loaded',
      resultType: 'Cashflows',
      calcParams: {}
    })

    let cnt = this.parenttabs.filter(pt=>pt.parentActualName===params.parentDisplayName).length
   

    let parentDisplayName = (cnt !== 0) ? `${params.parentDisplayName} ${cnt + 1}`: `${params.parentDisplayName}`

    let newParentTab = {
      parentDisplayName:parentDisplayName ,
      parentActualName:params.parentDisplayName,
      status : 'Loading',
      tabset:newTabSet}
    this.parenttabs.push(newParentTab);    
    this.selected.setValue(this.parenttabs.indexOf(newParentTab))

  }

  cashflowLoadStatusReceived(status: LoadStatusType){
    this.cashflowLoadStatus = status;
  }

  reRun(index: number){
    if(index >= 1){
      let displayName: string = this.parenttabs[index][0].displayName 
      let params = this.calcParamsMap[displayName]
      this.calcParamsMap[displayName] = null;
      this.calcParamsMap[displayName] = params
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
