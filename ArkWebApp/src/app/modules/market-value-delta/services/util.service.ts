import { Injectable } from '@angular/core';
import { Observable, combineLatest, forkJoin, of } from 'rxjs';
import { MarketValueDeltaService } from 'src/app/core/services/MarketValueDelta/market-value-delta.service';
import { MarketValueDeltaModel, NewIssuerOrAsset } from 'src/app/shared/models/MarketValueDeltaModel';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';
import { DataService } from 'src/app/core/services/data.service';
import { GridConfigService } from './grid-config.service';

@Injectable()
export class UtilService {

  rowData$ : Observable<MarketValueDeltaModel[]>

  currentAsOfDateRange$ : Observable<AsOfDateRange>

  currentNewIssuerOrAsset$ : Observable<NewIssuerOrAsset>

  constructor(
    private dataService: DataService,
    private marketValueDeltaService: MarketValueDeltaService,
    private gridConfigService: GridConfigService
  ) { 
    this.init()
  }

  init(){


    
  }
}
