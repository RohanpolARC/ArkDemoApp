import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { LoadStatus, MonthlyReturnsCalcParams, ParentTabType, PerfFeesCalcParams, ResultTab } from 'src/app/shared/models/IRRCalculationsModel';
import { IRRCalcParams } from 'src/app/shared/models/IRRCalculationsModel';
import { PortfolioModellerService } from '../service/portfolio-modeller.service';
import { MatLegacyTabChangeEvent as MatTabChangeEvent } from '@angular/material/legacy-tabs';

@Component({
  selector: 'app-tab-group-wrapper',
  templateUrl: './tab-group-wrapper.component.html',
  styleUrls: ['./tab-group-wrapper.component.scss']
})
export class TabGroupWrapperComponent implements OnInit {

  IRRCalcParamsInterface: IRRCalcParams
  MonthlyReturnsCalcParamsInterface: MonthlyReturnsCalcParams
  PerfFeesCalcParamsInterface: PerfFeesCalcParams
  ParentTabType : ParentTabType
  number : number
  boolean : boolean

  @Input() parentTab: ParentTabType
  @Output() status = new EventEmitter<LoadStatus>();
  @Output() noSubTabs = new EventEmitter<{index?:number,pDisplayName:string}>();

  pDisplayName: string
  subtabs: ResultTab[]
  selected = new UntypedFormControl(0);

  constructor(public portfolioModellerService: PortfolioModellerService) { }

  ngOnInit(): void { 

  }

  onSubTabChanged(event:MatTabChangeEvent){
    this.portfolioModellerService.updateTabGroupSelected(this.parentTab.index, event.index, "Child")
  }

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

  statusReceived(status: LoadStatus, index: number){
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