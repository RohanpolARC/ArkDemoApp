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

    //let calcParamsArray = {}
    let newTabSet:tabset =[]
    p.forEach((tabData)=>{
      // let cnt:number = 0
      // this.parenttabs.forEach(
      //   (parenttab)=>{
      //     cnt+=parenttab.tabset.filter(tab =>tab.actualName === tabData.tabName).length
      //   }
      // )
      // let displayName = (cnt !== 0) ? `${tabData.tabName} ${cnt + 1}`: `${tabData.tabName}`
      newTabSet.push({
        displayName: tabData.tabName,
        status: 'Loading',
        resultType: tabData.tabType,
        calcParams: tabData.calcParams
      })

      //calcParamsArray[tabData.tabName] = tabData.calcParams;

    })

    let cnt = this.parenttabs.filter(pt=>pt.parentActualName===params.parentDisplayName).length
   

    let parentDisplayName = (cnt !== 0) ? `${params.parentDisplayName} ${cnt + 1}`: `${params.parentDisplayName}`
    //this.calcParamsMap[parentDisplayName]  = calcParamsArray

    let newParentTab = {
      parentDisplayName:parentDisplayName ,
      parentActualName:params.parentDisplayName,
      status : 'Loading',
      tabset:newTabSet}
    this.parenttabs.push(newParentTab);    
    this.selected.setValue(this.parenttabs.indexOf(newParentTab))
   

    //let cnt: number = this.tabs.filter(tab => tab.actualName === p.tabName).length;
    // let newTab = {
    //   displayName: (cnt !== 0) ? `${p.tabName} ${cnt + 1}`: `${p.tabName}`,
    //   actualName: p.tabName,
    //   status: 'Loading',
    //   resultType: p.tabType
    // }

  }

  cashflowLoadStatusReceived(status: LoadStatusType){
    this.cashflowLoadStatus = status;
  }

  // irrCalcParamsReceived(params: IRRCalcParams){
  //   /** 
  //    * Calc params received from Portfolio Modeller. Now, creating a new tab for these params with IRR-result inside it.
  //   */

  //   let cnt: number = this.tabs.filter(tab => tab.actualName === params.modelName).length;
  //   let newTab = {
  //     displayName: (cnt !== 0) ? `${params.modelName} ${cnt + 1}`: `${params.modelName}`,
  //     actualName: `${params.modelName}`,
  //     status: 'Loading',
  //     resultType: 'IRR'
  //   }
  //   this.tabs.push(newTab);    
  //   this.selected.setValue(this.tabs.indexOf(newTab))
  //   this.calcParamsMap[newTab.displayName] = params;
  // }

  // returnsParamsReceived(params: MonthlyReturnsCalcParams){
  //   /** Return params received from Portfolio Modeller. Now creating a new tab for these params with Monthly Returns inside it */

  //   let tabName: string = `Monthly Returns`
  //   let cnt: number = this.tabs.filter(tab => tab.actualName === tabName).length;
  //   let newTab = {
  //     displayName: (cnt !== 0) ? `${tabName} ${cnt + 1}`: `${tabName}`,
  //     actualName: tabName,
  //     status: 'Loading',
  //     resultType: 'MonthlyReturns'
  //   }
  //   this.tabs.push(newTab);    
  //   this.selected.setValue(this.tabs.indexOf(newTab))
  //   this.calcParamsMap[newTab.displayName] = params;

  // }

  // /**
  //  * Originally: 
  //  * MonthlyReturns, IRR  
  //  */
  // createNewTab(tabName: string, params: PerfFeesCalcParams | MonthlyReturnsCalcParams | IRRCalcParams){
  //   let cnt: number = this.tabs.filter(tab => tab.actualName === tabName).length;
  //   let newTab = {
  //     displayName: (cnt !== 0) ? `${tabName} ${cnt + 1}`: `${tabName}`,
  //     actualName: tabName,
  //     status: 'Loading',
  //     resultType: tabName
  //   }
  //   this.tabs.push(newTab);    
  //   this.selected.setValue(this.tabs.indexOf(newTab))
  //   this.calcParamsMap[newTab.displayName] = params;
  // }

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
