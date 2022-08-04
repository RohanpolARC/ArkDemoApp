import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FacilityDetailService } from 'src/app/core/services/FacilityDetails/facility-detail.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-facility-detail-filter',
  templateUrl: './facility-detail-filter.component.html',
  styleUrls: ['./facility-detail-filter.component.scss']
})
export class FacilityDetailFilterComponent implements OnInit {

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

  constructor(private facilityDetailSvc: FacilityDetailService) { }

  ngOnInit(): void {
    this.fundSettings = { ...this.dropdownSettings, ...{  textField: 'fund' } }
    this.asOfDate = getMomentDateStr(getLastBusinessDay());
    this.onAsOfDateChange(this.asOfDate)
  }

  // ngOnChanges getting called before OnInit
  ngOnChanges(changes: SimpleChanges){
    if(changes?.['funds']){
      this.preSelectedFunds = changes['funds'].currentValue
    }
  }

  onFundChange(values){
    this.facilityDetailSvc.changeFundValues(values?.map(v => v.fund))
  }

  onAsOfDateChange(date){
    this.facilityDetailSvc.changeSearchDate(getMomentDateStr(date));
  }
}