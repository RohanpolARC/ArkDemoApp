import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, combineLatest, from, of } from 'rxjs';
import { catchError, map, skip, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { DataService } from 'src/app/core/services/data.service';
import { IFilterPaneParams } from 'src/app/shared/models/FilterPaneModel';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';
import { PoscashGridConfigService } from './poscash-grid-config.service';
import { PortfolioPositionCashflowService } from 'src/app/core/services/PortfolioPositionCashflow/portfolio-position-cashflow.service';
import { GridApi } from '@ag-grid-community/core';


@Injectable()
export class UtilService {

  constructor(
            private filterSvc: GeneralFilterService,
            private dataSvc: DataService,
            private poscashGridConfigSvc: PoscashGridConfigService,
            private portfolioPositionCashflowSvc: PortfolioPositionCashflowService
  ) {
    this.init();
  }

  rowData$: Observable<any[]> = of([])
  changeInAsOfDate$: Observable<string>
  changeInCashFlowTypeFilter$: Observable<string>

  init(){
    this.changeInAsOfDate$ = this.filterSvc.filterValueChanges.pipe(
      map((filters: IFilterPaneParams) => {
        let asOfDate:string
        if(filters){
          if(filters[723]){
            asOfDate =  getMomentDateStr(filters[723].value)
          }
        }
        return asOfDate
      })
    )

    this.changeInCashFlowTypeFilter$ = this.filterSvc.filterValueChanges.pipe(
      map((filters: IFilterPaneParams) => {
        let cashflowType:string = ''
        if(filters){
          if(filters[722]){
            cashflowType = filters[722].value?.[0]?.value
          }
        }
        return cashflowType
      })
    )

    this.rowData$ = this.dataSvc.filterApplyBtnState.pipe(
      skip(1),
      withLatestFrom(this.changeInAsOfDate$, this.changeInCashFlowTypeFilter$),
      switchMap(([isHit, asOfDate, cashflowType]) => {
        let posCashFlowGriddApi:GridApi = this.poscashGridConfigSvc.gridOptions?.api
        if(asOfDate && cashflowType && isHit) {
          posCashFlowGriddApi?.showLoadingOverlay();
          return this.portfolioPositionCashflowSvc.getPositionCashflows(asOfDate, cashflowType).pipe(
            tap(data => {
              if (data.length === 0) {
                this.poscashGridConfigSvc.noRowsToDisplayMsg = 'No data found for applied filter.';
              }
              posCashFlowGriddApi?.hideOverlay();
            }),
            catchError(error => {
              posCashFlowGriddApi?.showNoRowsOverlay();
              console.error("Error in fetching Position Cashflows Data" + error)
              return of([]);
            })
          )
        }
        return of([]);
      })
    )
  }

}
