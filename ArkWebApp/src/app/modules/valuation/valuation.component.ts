import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ValuationService } from 'src/app/core/services/Valuation/valuation.service';

@Component({
  selector: 'app-valuation',
  templateUrl: './valuation.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss', './valuation.component.scss']
})
export class ValuationComponent implements OnInit {

  asofdate: string;
  funds: string[]
  benchmarkIndexes: string[];

  constructor(
    private valuationSvc: ValuationService,
    private dataSvc: DataService  
  ) { }

  rowData$: Observable<any[]> = this.dataSvc.filterApplyBtnState.pipe(
    filter((isHit: boolean) => isHit),
    switchMap((isHit) => {
      return this.valuationSvc.getValuationData(this.asofdate, this.funds?.join(',')).pipe(
        tap((data: any[]) => {
          console.log(data);
        })
      )
    })
  )

  asOfDate$: Observable<string>;
  funds$: Observable<string[]>;

  ngOnInit(): void {
    
    this.asOfDate$ = this.valuationSvc.currentAsOfDate.pipe(
      tap((asOfDate: string) => {
        this.asofdate = asOfDate
      })
    )

    this.funds$ = this.valuationSvc.currentfundValues.pipe(
      tap((funds: string[]) => { 
        this.funds = funds;
      })
    )

    this.dataSvc.getUniqueValuesForField('BenchMark Index').pipe(take(1)).subscribe(d => {
      this.benchmarkIndexes = d.map((bmidx) => bmidx.value)
    })

  }


}
