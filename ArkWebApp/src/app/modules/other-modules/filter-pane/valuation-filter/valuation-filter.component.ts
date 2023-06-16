import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ValuationService } from 'src/app/core/services/Valuation/valuation.service';
import { getLastBusinessDay, getLastQuarterEnd, getMomentDateStr } from 'src/app/shared/functions/utilities';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';

@Component({
  selector: 'app-valuation-filter',
  templateUrl: './valuation-filter.component.html',
  styleUrls: ['./valuation-filter.component.scss']
})
export class ValuationFilterComponent implements OnInit, OnChanges {

  @Input() funds
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

  searchDateRange: FormGroup
  range: AsOfDateRange = null
  searchDateRange$: Observable<AsOfDateRange>

  constructor(private valuationSvc: ValuationService,
    private dataSvc: DataService) { }

  ngOnInit(): void {
    this.fundSettings = { ...this.dropdownSettings, ...{  textField: 'fund' } }
    this.markTypeSettings = { ...this.dropdownSettings, ... { textField: 'markType' } }


    this.markTypes = [ 
      { id: 1, markType: 'Impaired Cost' },
      { id: 2, markType: 'Mark To Market' },
      { id: 3, markType: 'Hedging Mark' }
    ]

    this.preSelectedMarkTypes = this.markTypes.filter(x => ['Impaired Cost', 'Mark To Market'].includes(x['markType']))

    this.range = {
      start: getMomentDateStr(getLastQuarterEnd()),
      end: getMomentDateStr(getLastBusinessDay())
    }

    this.searchDateRange = new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
    });

    this.searchDateRange$ = this.searchDateRange.valueChanges.pipe(
      debounceTime(200),
      tap((dtRange) => { 
        this.getSearchDateRange()
        return dtRange; 
      }) 
    )

    // searchDateRange$ start listening only after it exists the ngOnInit and patchValue updates synchronously
    setTimeout(() => {
      this.searchDateRange.patchValue({
        start: this.range.start, end: this.range.end
      })
    }, 0)
  }x    

  ngOnChanges(changes: SimpleChanges){
    if(changes?.['funds']?.currentValue){
      this.preSelectedFunds = this.funds?.filter(x => ['SL2', 'DL4'].includes(x['fund']))
    }
  }

  onFundChange(values){
    this.valuationSvc.changeFundValues(values?.map(v => v.fund));
  }

  onMarkTypeChange(values){
    this.valuationSvc.changeMarkType(values?.map(v => v.markType));
  }

  getSearchDateRange(){

    this.range.start = getMomentDateStr(this.searchDateRange.get('start').value);
    this.range.end = getMomentDateStr(this.searchDateRange.get('end').value);

    if(this.range.end === 'Invalid date')
      this.range.end = this.range.start;
    
    this.valuationSvc.changeSearchDateRange(this.range);
  }
}
