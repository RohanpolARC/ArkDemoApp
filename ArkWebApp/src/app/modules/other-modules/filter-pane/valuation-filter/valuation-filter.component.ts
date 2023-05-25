import { Component, Input, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ValuationService } from 'src/app/core/services/Valuation/valuation.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-valuation-filter',
  templateUrl: './valuation-filter.component.html',
  styleUrls: ['./valuation-filter.component.scss']
})
export class ValuationFilterComponent implements OnInit {

  @Input() funds
  asOfDate: string = null;
  fundSettings: IDropdownSettings
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

  constructor(private valuationSvc: ValuationService) { }

  ngOnInit(): void {
    this.fundSettings = { ...this.dropdownSettings, ...{  textField: 'fund' } }
    this.asOfDate = getMomentDateStr(getLastBusinessDay());
    this.onAsOfDateChange(this.asOfDate)
  }

  onFundChange(values){
    this.valuationSvc.changeFundValues(values?.map(v => v.fund))
  }

  onAsOfDateChange(date){
    this.valuationSvc.changeAsOfDate(getMomentDateStr(date));
  }
}
