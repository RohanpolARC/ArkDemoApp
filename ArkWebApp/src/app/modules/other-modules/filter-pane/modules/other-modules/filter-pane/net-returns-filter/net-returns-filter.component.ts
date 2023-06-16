import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NetReturnsService } from 'src/app/core/services/NetReturns/net-returns.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-net-returns-filter',
  templateUrl: './net-returns-filter.component.html',
  styleUrls: ['./net-returns-filter.component.scss']
})
export class NetReturnsFilterComponent implements OnInit {

  @Input() fundHedgings
  @Input() calcMethods
  @Input() cashflowTypes

  asOfDate: string = null;
  fundHedgingSettings: IDropdownSettings
  calcMethodSettings: IDropdownSettings
  cashflowTypeSettings: IDropdownSettings
  dropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'text',
    itemsShowLimit: 1,
    allowSearchFilter: true
  }

  preselectedFundhedgings
  preselectedCalcmethods
  preselectedCashflowTypes

  saveNetReturns: any;

  
  constructor(private netReturnsSvc: NetReturnsService) { }

  ngOnInit(): void {
    this.fundHedgingSettings = { ...this.dropdownSettings, ...{textField: 'fundHedging'} }
    this.calcMethodSettings = { ...this.dropdownSettings, ...{textField: 'calcMethod'} }
    this.cashflowTypeSettings = { ...this.dropdownSettings, ...{textField: 'cashflowType'}}
    this.asOfDate = getMomentDateStr(getLastBusinessDay());
    this.onAsOfDateChange(this.asOfDate)

    this.saveNetReturns = false
    this.onSaveNetReturnsChange(this.saveNetReturns)
  }

  // ngOnChanges getting called before OnInit
  ngOnChanges(changes: SimpleChanges){
    if(changes?.['fundHedgings']?.currentValue){
      this.preselectedFundhedgings = this.fundHedgings.filter(x=> x['fundHedging'] === 'SL2FEUR')
    }
    if(changes?.['calcMethods']?.currentValue){
      this.preselectedCalcmethods = [changes['calcMethods'].currentValue?.[0]]
    }
    if(changes?.['cashflowTypes']?.currentValue){
      this.preselectedCashflowTypes = [changes['cashflowTypes'].currentValue?.[0]]
    }
  }

  onFundHedgingChange(value){
    this.netReturnsSvc.changeFundHedgingValues(value?.map(v => v.fundHedging)?.[0])
  }

  onAsOfDateChange(date){
    this.netReturnsSvc.changeSearchDate(getMomentDateStr(date));
  }

  onCalcMethodChange(value){
    this.netReturnsSvc.changeCalcMethod(value?.map(v => v.calcMethod)?.[0])
  }

  onCashflowTypeChange(value){
    this.netReturnsSvc.changeCashflowType(value?.map(v => v.cashflowType)?.[0])
  }

  onSaveNetReturnsChange(value){
    this.netReturnsSvc.changeSaveNetReturns(value)
  }
}
