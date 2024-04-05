import { Injectable } from '@angular/core';
import { Observable, combineLatest, forkJoin, of } from 'rxjs';
import { MarketValueDeltaService } from 'src/app/core/services/MarketValueDelta/market-value-delta.service';
import { MarketValueDeltaModel, NewIssuerOrAsset } from 'src/app/shared/models/MarketValueDeltaModel';
import { AsOfDateRange, IFilterPaneParams } from 'src/app/shared/models/FilterPaneModel';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { filter, map, skip, switchMap, withLatestFrom } from 'rxjs/operators';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';
import { DataService } from 'src/app/core/services/data.service';
import { GridConfigService } from './grid-config.service';

@Injectable()
export class UtilService {

  rowData$ : Observable<MarketValueDeltaModel[]>

  currentAsOfDateRange$ : Observable<AsOfDateRange>

  currentNewIssuerOrAsset$ : Observable<NewIssuerOrAsset>

  constructor(
    private dataService: DataService,
    private filterService: GeneralFilterService,
    private marketValueDeltaService: MarketValueDeltaService,
    private gridConfigService: GridConfigService
  ) { 
    this.init()
  }

  init(){

    this.currentAsOfDateRange$ = this.filterService.filterValueChanges.pipe(
      map((filters: IFilterPaneParams) => {
        let asOfDateRange : AsOfDateRange
        if(filters){
          if(filters[36]){
            asOfDateRange = {
              start : getMomentDateStr(filters[36].value?.start),
              end :getMomentDateStr(filters[36].value?.end)
            }
          }
        }
        return asOfDateRange
      })
    )

    this.currentNewIssuerOrAsset$ = this.filterService.filterValueChanges.pipe(
      map((filters: IFilterPaneParams) => {
        let newIssuerOrAsset : NewIssuerOrAsset
        if(filters){
          if(filters[37]){
            newIssuerOrAsset = filters[37].value?.[0]?.value
          }
        }
        return newIssuerOrAsset
      })
    )

    this.rowData$ = this.dataService.filterApplyBtnState.pipe(
      skip(1),     // We add this skip operator to skip last emitted value of filterApplyBtnState observable which is Behaviour Subject, it prevents grid from loading data by default.
      withLatestFrom(this.currentAsOfDateRange$, this.currentNewIssuerOrAsset$),
      filter(([isHit, currentAsOfDateRange, currentNewIssuerOrAsset]) => 
      !!isHit && currentAsOfDateRange.start != 'Invalid date' && currentAsOfDateRange.end != 'Invalid date' && !!currentNewIssuerOrAsset
      ),
      switchMap(([isHit,currentAsOfDateRange, currentNewIssuerOrAsset]) => {
        this.gridConfigService.gridApi?.showLoadingOverlay()
            return this.marketValueDeltaService.getMarketValueDeltaData(currentAsOfDateRange,currentNewIssuerOrAsset).pipe(
              map(data => {
                return data
              })
            )
      })
    
    )
    
  }
}
