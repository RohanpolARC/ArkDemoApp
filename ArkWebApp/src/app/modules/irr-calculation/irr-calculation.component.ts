import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcParams } from 'src/app/shared/models/IRRCalculationsModel';
import { IrrResultComponent } from './irr-result/irr-result.component';

@Component({
  selector: 'app-irr-calculation',
  templateUrl: './irr-calculation.component.html',
  styleUrls: ['./irr-calculation.component.scss']
})
export class IrrCalculationComponent implements OnInit {

  asOfDate: string
  constructor(
    private dataService: DataService
  ) { }

  subscriptions: Subscription[] = []
  tabs : {
    actualName: string, 
    displayName: string,
    status: string    // Loaded, Loading, Failed
  }[] = [{
    actualName: 'Portfolio Modeller',
    displayName: 'Portfolio Modeller',
    status: 'Loaded'
  }];

  selected = new FormControl(0);

  calcParamsMap = {} //<model name, IRRCalcParams>

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  ngOnInit(): void {
    this.subscriptions.push(this.dataService.currentSearchDate.subscribe(asOfDate => {
      this.asOfDate = asOfDate;
    }));

    this.subscriptions.push(this.dataService.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.tabs = [{
          actualName: 'Portfolio Modeller',
          displayName: 'Portfolio Modeller',
          status: 'Loaded'
        }]
      }
    }))

  }
  statusReceived(status: string, index: number){
    if(index >= 1){
      this.tabs[index].status = status
    }
  }

  irrCalcParamsReceived(params: IRRCalcParams){
    console.log(params)
    /** 
     * Calc params received from Portfolio Modeller. Now, creating a new tab for these params with IRR-result inside it.
    */

    let cnt: number = this.tabs.filter(tab => tab.actualName === params.modelName).length;
    let newTab = {
      displayName: (cnt !== 0) ? `${params.modelName} ${cnt + 1}`: `${params.modelName}`,
      actualName: `${params.modelName}`,
      status: 'Loading'
    }
    this.tabs.push(newTab);    
    this.selected.setValue(this.tabs.indexOf(newTab))
    this.calcParamsMap[newTab.displayName] = params;
  }

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
