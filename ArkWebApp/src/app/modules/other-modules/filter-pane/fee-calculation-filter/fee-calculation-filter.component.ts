import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FeeCalculationService } from 'src/app/core/services/FeeCalculation/fee-calculation.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-fee-calculation-filter',
  templateUrl: './fee-calculation-filter.component.html',
  styleUrls: ['./fee-calculation-filter.component.scss']
})
export class FeeCalculationFilterComponent implements OnInit {

  @Input() entities
  asOfDate: string = null;
  entitySettings: IDropdownSettings
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'text',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  preSelectedEntity

  constructor(private feeCalcSvc: FeeCalculationService) { }

  ngOnInit(): void {
    this.entitySettings = { ...this.dropdownSettings, ...{  textField: 'entity', singleSelection: true } }
    this.asOfDate = getMomentDateStr(getLastBusinessDay());
    this.onAsOfDateChange(this.asOfDate)
  }

  // ngOnChanges getting called before OnInit

  ngOnChanges(changes: SimpleChanges){
    if(changes?.['entities']){
      this.preSelectedEntity = [changes['entities']?.currentValue?.[0]]
    }
  }

  onEntityChange(value){
    this.feeCalcSvc.changeEntityValue(value[0]?.entity)
  }

  onAsOfDateChange(date){
    this.feeCalcSvc.changeSearchDate(getMomentDateStr(date));
  }

}
