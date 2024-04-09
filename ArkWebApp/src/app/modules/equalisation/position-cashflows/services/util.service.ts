import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, combineLatest, from, of, zip } from 'rxjs';
import { catchError, map, skip, skipUntil, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { EqualisationService } from 'src/app/core/services/Equalisation/equalisation.service';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { DataService } from 'src/app/core/services/data.service';
import { IFilterPaneParams } from 'src/app/shared/models/FilterPaneModel';
import { EqPoscashGridConfigService } from './eq-poscash-grid-config.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';
import { GridApi } from '@ag-grid-community/core';


@Injectable()
export class UtilService{

  constructor(private equalisationSvc: EqualisationService,
            private filterSvc: GeneralFilterService,
            private dataSvc: DataService,
            private eqPoscashGridConfigSvc: EqPoscashGridConfigService
  ) { 
    this.init();
  }

  rowData$: Observable<any[]> = of([])
  changeInAsOfDate$: Observable<string>
  changeInFundsFilter$: Observable<string>


  init(){

    this.changeInAsOfDate$ = this.filterSvc.filterValueChanges.pipe(
      map((filters: IFilterPaneParams) => {
        let asOfDate:string
        if(filters){
          if(filters[711]){
            asOfDate =  getMomentDateStr(filters[711].value)
          }
        }
        return asOfDate
      })
    )

    this.changeInFundsFilter$ = this.filterSvc.filterValueChanges.pipe(
      map((filters: IFilterPaneParams) => {
        let fundString:string = ''
        if(filters){
          if(filters[712]){
            filters[712].value?.forEach((fund) => {
              fundString += fund.value + ','
            });
            fundString = fundString.slice(0,fundString.length-1)
            return fundString
          }
        }
        return fundString
      })
    )

    this.rowData$ = this.dataSvc.filterApplyBtnState.pipe(
      skip(1),
      withLatestFrom(this.changeInAsOfDate$, this.changeInFundsFilter$),
      switchMap(([isHit,asOfDate, funds]) => {
        let eqPosGriddApi:GridApi = this.eqPoscashGridConfigSvc.gridOptions?.api
        if(isHit && asOfDate && funds) {
          eqPosGriddApi?.showLoadingOverlay();

          return this.equalisationSvc.getPositionCashflowsEqualised(asOfDate, funds).pipe(
            tap(data => {
              if (data.length === 0) {
                this.eqPoscashGridConfigSvc.noRowsToDisplayMsg = 'No data found for applied filter.';
              }
              eqPosGriddApi?.hideOverlay();
            }),
            catchError(error => {
              eqPosGriddApi?.showNoRowsOverlay();
              console.error("Error in fetching Equalised Position Cashflows Data" + error)
              return of([]);
            })
          )
        }     
        return of([]);
      })
    ) 
  }
}
