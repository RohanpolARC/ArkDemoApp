import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ContractHistoryService } from 'src/app/core/services/ContractHistory/contract-history.service';

@Component({
  selector: 'app-contract-history-filter',
  templateUrl: './contract-history-filter.component.html',
  styleUrls: ['./contract-history-filter.component.scss']
})
export class ContractHistoryFilterComponent implements OnInit, OnChanges {

  @Input() funds
  
  fundSettings: IDropdownSettings
  isLatest: boolean
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'text',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
    // maxHeight: 100
  };

  preSelectedFunds

  constructor(private contractHistorySvc: ContractHistoryService) { }

  ngOnInit(): void {

    this.isLatest = true
    this.onLatestToggle(true)  


    this.fundSettings = { ...this.dropdownSettings, ...{  textField: 'fund' } }
  }

  // ngOnChanges getting called before OnInit
  ngOnChanges(changes: SimpleChanges){

    if(changes?.['funds']){
      this.preSelectedFunds = changes['funds'].currentValue?.filter(x => String(x?.['fund']).toLowerCase().includes('dl3'))
    }
  }

  onFundChange(values){
    this.contractHistorySvc.changeFundValues(values?.map(v => v.fund))
  }

  onLatestToggle(isLatest){
    this.contractHistorySvc.changeisLatestValue(isLatest)
  }
}