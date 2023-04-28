import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { LiquiditySummaryService } from 'src/app/core/services/LiquiditySummary/liquidity-summary.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-liquidity-summary-filter',
  templateUrl: './liquidity-summary-filter.component.html',
  styleUrls: ['./liquidity-summary-filter.component.scss']
})
export class LiquiditySummaryFilterComponent implements OnInit {

  @Input() fundHedgings
  asOfDate: string = null;
  days: number;
  fundHedgingSettings: IDropdownSettings
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'text',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };
  preSelectedFundHedgings
  includeCoinvest: any;

  constructor(private liquiditySmySvc: LiquiditySummaryService) { }

  ngOnInit(): void {
    this.fundHedgingSettings = { ...this.dropdownSettings, ...{  textField: 'fundHedging' } }
    this.asOfDate = getMomentDateStr(getLastBusinessDay());
    this.onAsOfDateChange(this.asOfDate)
    this.days = 10
    this.onDaysChange(this.days)
    this.onIncludeCoinvestToggle(this.includeCoinvest)
  }

  // ngOnChanges getting called before OnInit
  ngOnChanges(changes: SimpleChanges){
    if(changes?.['fundHedgings']){
      this.preSelectedFundHedgings = changes['fundHedgings'].currentValue?.filter(x => String(x?.['fundHedging']).toLowerCase().includes('dl3'))
    }
  }

  onFundHedgingChange(values){
    this.liquiditySmySvc.changeFundHedgingValues(values?.map(v => v.fundHedging))
  }

  onAsOfDateChange(date){
    this.liquiditySmySvc.changeSearchDate(getMomentDateStr(date));
  }

  onDaysChange(days){
    this.liquiditySmySvc.changenoofdaysValues(days);
  }

  onIncludeCoinvestToggle(includeCoinvest){
    this.liquiditySmySvc.changeincludeCoinvestValue(includeCoinvest)
  }
}