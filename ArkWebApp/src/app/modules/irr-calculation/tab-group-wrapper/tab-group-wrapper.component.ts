import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IRRCalcParams, MonthlyReturnsCalcParams, PerfFeesCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

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



  //@Input() calcParamsMap
  //@Input() pDisplayName
  @Input() parentTab:{
    parentDisplayName: string,
    parentActualName:string,
    status:string,
    tabset:tabset
  }
  @Output() status = new EventEmitter<string>();
  @Output() noSubTabs = new EventEmitter<{index?:number,pDisplayName:string}>();

  pDisplayName
  subtabs: tabset

  selected = new FormControl(0);


  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    

  }

  async ngOnChanges(changes: SimpleChanges){
    this.pDisplayName = this.parentTab.parentDisplayName
    // this.subtabs = this.parentTab.tabset
    // console.log(this.subtabs)

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let subtabs = this.parentTab.tabset;

    this.subtabs = []
    for(let i = 0; i < subtabs?.length; i+= 1 ){

      await sleep(500);

      this.subtabs.push(subtabs[i])
      this.selected.setValue(i)
    }

  }

  statusReceived(status: string, index: number){
    this.subtabs[index].status = status
    let failCount = this.subtabs.filter(_=>_.status==='Failed').length
    let completeCount = this.subtabs.filter(_=>_.status==='Loaded').length
    if(failCount===0 && status==='Failed'){
        this.status.emit(status)
    }
    if(completeCount===this.subtabs.length && status==='Loaded'){
        //this.subtabs.includes()
        this.status.emit(status)
    }
  }

  reRun(index: number){
      //let displayName: string = this.subtabs[index].displayName //to be changed later
      // let params = this.calcParamsMap[displayName]
      // this.calcParamsMap[displayName] = null;
      // this.calcParamsMap[displayName] = params
  }
  removeTab(index: number) {
    this.subtabs.splice(index, 1);
    if(this.subtabs.length===0){
      this.noSubTabs.emit({pDisplayName:this.pDisplayName})
    }
  }

}
