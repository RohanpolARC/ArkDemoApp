import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-irr-calculation',
  templateUrl: './irr-calculation.component.html',
  styleUrls: ['./irr-calculation.component.scss']
})
export class IrrCalculationComponent implements OnInit {

  constructor(
    private dataService: DataService
  ) { }

  subscriptions: Subscription[] = []
  tabs = ['Portfolio Modeller'];
  selected = new FormControl(0);

  calcParamsMap = {} //<model name, IRRCalcParams>

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  ngOnInit(): void {
    this.subscriptions.push(this.dataService.filterApplyBtnState.subscribe(isHit => {
      if(isHit){
        this.tabs = ['Portfolio Modeller']
      }
    }))

  }

  irrCalcParamsReceived(params: IRRCalcParams){
    console.log(params)
    /** 
     * Calc params received from Portfolio Modeller. Now, creating a new tab for these params with IRR-result inside it.
    */

    this.calcParamsMap[params.modelName] = params;

    if(!this.tabs.includes(params.modelName)){
      this.tabs.push(params.modelName);

    }
    
    this.selected.setValue(this.tabs.indexOf(params.modelName))
  }

}
