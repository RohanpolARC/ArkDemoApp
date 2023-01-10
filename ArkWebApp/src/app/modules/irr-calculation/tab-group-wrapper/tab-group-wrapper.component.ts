import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ParentTabType } from '../irr-calculation.component';
import { LoadStatusType } from '../portfolio-modeller/portfolio-modeller.component';

type tabset = {
  displayName: string,
  status: string,    // Loaded, Loading, Failed
  resultType: string,    //'IRR' | 'MonthlyReturn' | 'PortfolioModeller'
  calcParams?: any//IRRCalcParams | MonthlyReturnsCalcParams | PerfFeesCalcParams
}[]

@Component({
  selector: 'app-tab-group-wrapper',
  templateUrl: './tab-group-wrapper.component.html',
  styleUrls: ['./tab-group-wrapper.component.scss']
})
export class TabGroupWrapperComponent implements OnInit {

  @Input() parentTab: ParentTabType
  @Output() status = new EventEmitter<LoadStatusType>();
  @Output() noSubTabs = new EventEmitter<{index?:number,pDisplayName:string}>();

  pDisplayName
  subtabs: tabset
  selected = new FormControl(0);

  constructor() { }

  ngOnInit(): void { }

  async ngOnChanges(changes: SimpleChanges){
    this.pDisplayName = this.parentTab.parentDisplayName

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let subtabs = this.parentTab.tabset;
    this.subtabs = []

    for(let i = 0; i < subtabs?.length; i+= 1 ){

      await sleep(500);

      if(subtabs[i].resultType === 'IRR')
        subtabs[i].displayName = `IRR (${subtabs[i].calcParams?.['aggrStr']?.join(' > ')})`;

      this.subtabs.push(subtabs[i])
      this.selected.setValue(i)
    }

  }

  statusReceived(status: LoadStatusType, index: number){
    this.subtabs[index].status = status
    let completeCount = this.subtabs.filter(_ => _.status === 'Loaded').length
    if(status === 'Failed'){
        this.status.emit(status)
    }
    if(completeCount === this.subtabs.length && status === 'Loaded'){
        this.status.emit(status)
    }
  }

  reRun(index: number){ }

  removeTab(index: number) {
    this.subtabs.splice(index, 1);
    if(this.subtabs.length===0){
      this.noSubTabs.emit({pDisplayName:this.pDisplayName})
    }
  }

}
