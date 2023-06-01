import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ValuationService } from 'src/app/core/services/Valuation/valuation.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-valuation-filter',
  templateUrl: './valuation-filter.component.html',
  styleUrls: ['./valuation-filter.component.scss']
})
export class ValuationFilterComponent implements OnInit, OnChanges {

  @Input() funds
  asOfDate: string = null;
  fundSettings: IDropdownSettings
  markTypeSettings: IDropdownSettings
  markTypes: { id: number, markType: string }[]

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'text',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  preSelectedFunds
  preSelectedMarkTypes

  constructor(private valuationSvc: ValuationService) { }

  ngOnInit(): void {
    this.fundSettings = { ...this.dropdownSettings, ...{  textField: 'fund' } }
    this.markTypeSettings = { ...this.dropdownSettings, ... { textField: 'markType' } }
    this.asOfDate = getMomentDateStr(getLastBusinessDay());
    this.onAsOfDateChange(this.asOfDate)

    this.markTypes = [ 
      { id: 1, markType: 'Impaired Cost' },
      { id: 2, markType: 'Mark To Market' },
      { id: 3, markType: 'Hedging Mark' }
    ]

    this.preSelectedMarkTypes = this.markTypes.filter(x => ['Impaired Cost', 'Mark To Market'].includes(x['markType']))
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes?.['funds']?.currentValue){
      this.preSelectedFunds = this.funds?.filter(x => ['SL2', 'DL4'].includes(x['fund']))
    }
  }

  onFundChange(values){
    this.valuationSvc.changeFundValues(values?.map(v => v.fund));
  }

  onAsOfDateChange(date){
    this.valuationSvc.changeAsOfDate(getMomentDateStr(date));
  }

  onMarkTypeChange(values){
    this.valuationSvc.changeMarkType(values?.map(v => v.markType));
  }
}
