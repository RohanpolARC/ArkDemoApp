import { Injectable } from '@angular/core';
import {  Observable, of } from 'rxjs';
import { catchError, map, skip, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { EqualisationService } from 'src/app/core/services/Equalisation/equalisation.service';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { DataService } from 'src/app/core/services/data.service';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';
import { GridConfigService } from './grid-config.service';
import { GridOptions } from '@ag-grid-community/core';
import { IFilterPaneParams } from 'src/app/shared/models/FilterPaneModel';

@Injectable()
export class UtilService {

  constructor(
    private equalisationSvc: EqualisationService,
    private dataSvc: DataService,
    private filterSvc: GeneralFilterService,
    private gridConfigSvc: GridConfigService
  ) { 
    this.init();
  }

  rowData$: Observable<any[]> = of([])
  changeInAsOfDate$: Observable<string>
  gridOptions: GridOptions

  init(){
    
    this.gridOptions = this.gridConfigSvc.gridOptions

    this.changeInAsOfDate$ = this.filterSvc.filterValueChanges.pipe(
      map((filters: IFilterPaneParams) => {
        let asOfDate: string
        if(filters){
          if(filters[721]){
            asOfDate = getMomentDateStr(filters[721].value)
          }
        }
        return asOfDate
      })
    )

    this.rowData$ = this.dataSvc.filterApplyBtnState.pipe(
      skip(1),        // We add this skip operator to skip last emitted value of filterApplyBtnState observable which is Behaviour Subject, it prevents grid from loading data by default.
      withLatestFrom(this.changeInAsOfDate$),
      switchMap(([isHit,asOfDate]) => {
        if(asOfDate != null && isHit){
          this.gridOptions?.api?.showLoadingOverlay();
          return this.equalisationSvc.getPortfolioHistoryEqualised(asOfDate).pipe(
            tap(data => {
               if(data.length === 0) {
                this.gridConfigSvc.noRowsToDisplayMsg = 'No data found for applied filter.';
               }
                this.gridOptions?.api?.hideOverlay();
            }),
            catchError(error => {
              this.gridOptions?.api?.showNoRowsOverlay();
              console.error("Error in fetching Portfolio History Data" + error)
              return of([]); 
            })
          );
        }
        return of([])
      })
    )

   }
}
