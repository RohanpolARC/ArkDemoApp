import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CashBalanceService } from 'src/app/core/services/CashBalance/cash-balance.service';
import { DataService } from 'src/app/core/services/data.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';

@Component({
  selector: 'app-cash-balance-filter',
  templateUrl: './cash-balance-filter.component.html',
  styleUrls: ['./cash-balance-filter.component.scss']
})
export class CashBalanceFilterComponent implements OnInit {

  subscriptions: Subscription[] = []
  searchDateRange: FormGroup
  range: AsOfDateRange = null;

  constructor(
    private cashBalanceSvc: CashBalanceService,
    private dataSvc: DataService
  ) { }

  getSearchDateRange(){

    this.range.start = getMomentDateStr(this.searchDateRange.get('start').value);
    this.range.end = getMomentDateStr(this.searchDateRange.get('end').value);

    if(this.range.end === 'Invalid date')
      this.range.end = this.range.start;
    
    this.cashBalanceSvc.changeSearchDateRange(this.range);
  }

  ngOnInit(): void {
    this.range = {
      start: getMomentDateStr(getLastBusinessDay()),
      end: getMomentDateStr(getLastBusinessDay())
    }

    this.searchDateRange = new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
    });

    this.subscriptions.push(this.searchDateRange.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(dtRange => {
      this.getSearchDateRange();
    }))

    this.searchDateRange.patchValue({
      start: this.range.start, end: this.range.end
    })

    // Hitting filter apply button at the end of event queue, since this.getSearchDateRange() will set dates in event queue before
    setTimeout(() => {
      this.dataSvc.changeFilterApplyBtnState(true)
    }, 0)
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
  }

}
