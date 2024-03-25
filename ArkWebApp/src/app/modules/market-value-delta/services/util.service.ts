import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MarketValueDeltaService } from 'src/app/core/services/MarketValueDelta/market-value-delta.service';
import { MarketValueDeltaModel } from 'src/app/shared/models/MarketValueDeltaModel';
import { AsOfDateRange, IFilterPaneParams } from 'src/app/shared/models/FilterPaneModel';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { map, switchMap } from 'rxjs/operators';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';
import { DataService } from 'src/app/core/services/data.service';
import { GridConfigService } from './grid-config.service';

@Injectable()
export class UtilService {

  rowData$ : Observable<MarketValueDeltaModel[]>

  asOfDateRange: AsOfDateRange
  currentAsOfDateRange$ : Observable<AsOfDateRange>

  newIssuerOrAsset : string
  currentNewIssuerOrAsset$ : Observable<string>

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
        if(filters){
          if(filters[36]){
            this.asOfDateRange = {
              start : getMomentDateStr(filters[36].value?.start),
              end :getMomentDateStr(filters[36].value?.end)
            }
          }
        }
        return this.asOfDateRange
      })
    )

    this.currentNewIssuerOrAsset$ = this.filterService.filterValueChanges.pipe(
      map((filters: IFilterPaneParams) => {
        if(filters){
          if(filters[37]){
            this.newIssuerOrAsset = filters[37].value?.[0]?.value
          }
        }
        return this.newIssuerOrAsset
      })
    )

    this.rowData$ = this.dataService.filterApplyBtnState.pipe(
      switchMap((isHit) => {
        if(isHit && this.asOfDateRange != null && this.newIssuerOrAsset != null){
          this.gridConfigService.gridApi?.showLoadingOverlay()
          return this.marketValueDeltaService.getMarketValueDeltaData(this.asOfDateRange,this.newIssuerOrAsset).pipe(
            map((data) => {
              return data
            })
          )
        }
        return of([])
      })
    )
  }
}
