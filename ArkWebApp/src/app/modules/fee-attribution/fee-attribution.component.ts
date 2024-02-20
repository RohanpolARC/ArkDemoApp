import { Component, OnDestroy, OnInit } from '@angular/core';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { AsOfDateRange, FilterValueChangeParams } from 'src/app/shared/models/FilterPaneModel';
import { FeeAttributionService } from './services/fee-attribution.service';
import { Observable, Subscription } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { GridConfigService } from './services/grid-config.service';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';
import { GridUtilService } from './services/grid-util.service';

@Component({
  selector: 'app-fee-attribution',
  templateUrl: './fee-attribution.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './fee-attribution.component.scss'],
  providers: [
    GridConfigService,
    GridUtilService
  ]
})
export class FeeAttributionComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = []
  asofdate: string  // YYYY-MM-DD
  asofdate$: Observable<string>
  asOfDateRange$: Observable<AsOfDateRange>;
  asOfDateRange: AsOfDateRange
  funds$: Observable<string[]>
  funds: string[]
  rowData$: Observable<any[]>
  constructor(private filterSvc: GeneralFilterService,
    private feeAttributionSvc: FeeAttributionService,
    private gridConfigSvc: GridConfigService,
    private dataSvc: DataService) { }
  ngOnInit(): void {

    this.asofdate$ = this.feeAttributionSvc.currentAsofdateValue$.pipe(
      filter((asofdate: string) => !!asofdate),
      tap((asofdate: string) => {
        this.asofdate = asofdate
      })
    )

    this.asOfDateRange$ = this.feeAttributionSvc.currentAsofdateRangeValues$.pipe(
      filter((asofdateR: AsOfDateRange) => !!asofdateR),
      tap((asofdateR: AsOfDateRange) => {
        this.asOfDateRange = asofdateR;
      })
    )

    this.funds$ = this.feeAttributionSvc.currentfundValues$.pipe(
      filter((funds: string[]) => funds?.length > 0),
      tap((funds: string[]) => {
        this.funds = funds;
      })
    )

    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe((filter: FilterValueChangeParams) => {
      if(filter?.id === 441){
        let funds: string[] = filter?.value?.map(fund => fund?.value);
        this.feeAttributionSvc.changeFundValues(funds);
      }
      else if(filter?.id === 442){
        this.feeAttributionSvc.changeAsofdateRange(filter?.value)
      }
      else if(filter?.id === 443){
        this.feeAttributionSvc.changeAsofdate(getMomentDateStr(filter?.value))
      }
    }))

    this.rowData$ = this.dataSvc.filterApplyBtnState.pipe(
      filter((isHit: boolean) => isHit && !!this.asOfDateRange && !!this.funds?.length),
      tap(() => { this.gridConfigSvc.gridApi.showLoadingOverlay() }),
      switchMap((isHit) => this.feeAttributionSvc.getFeeAttribution(this.asOfDateRange, this.asofdate, this.funds))
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
