import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { IRRCalcParams, MonthlyReturnsCalcParams, PerfFeesCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

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
  tabs : {
    actualName: string, 
    displayName: string,
    status: string,    // Loaded, Loading, Failed
    resultType: string    //'IRR' | 'MonthlyReturn' | 'PortfolioModeller'
  }[] = [{
    actualName: 'Portfolio Modeller',
    displayName: 'Portfolio Modeller',
    status: 'Loaded',
    resultType: 'PortfolioModeller'
  }];

  selected = new FormControl(0);

  calcParamsMap = {} //<model name, IRRCalcParams>

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  ngOnInit(): void {
    this.subscriptions.push(this.irrCalcSvc.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataSvc.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.tabs = [{
          actualName: 'Portfolio Modeller',
          displayName: 'Portfolio Modeller',
          status: 'Loaded',
          resultType: 'PortfolioModeller'
        }]
      }
    }))

  }
  statusReceived(status: string, index: number){
    if(index >= 1){
      this.tabs[index].status = status
    }
  }

  /**
   * 
   * @param tabType ${Model Name} / Monthly Returns / IRR 
   * @param params IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesParams
   */
  calcParamsReceived(p: {tabName: string, tabType: string, calcParams: IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesCalcParams}){

    let cnt: number = this.tabs.filter(tab => tab.actualName === p.tabName).length;
    let newTab = {
      displayName: (cnt !== 0) ? `${p.tabName} ${cnt + 1}`: `${p.tabName}`,
      actualName: p.tabName,
      status: 'Loading',
      resultType: p.tabType
    }
    this.tabs.push(newTab);    
    this.selected.setValue(this.tabs.indexOf(newTab))
    this.calcParamsMap[newTab.displayName] = p.calcParams;
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
      let displayName: string = this.tabs[index].displayName
      let params = this.calcParamsMap[displayName]
      this.calcParamsMap[displayName] = null;
      this.calcParamsMap[displayName] = params
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
