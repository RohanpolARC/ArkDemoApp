import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';
import { MarketValueDeltaModel, NewIssuerOrAsset } from 'src/app/shared/models/MarketValueDeltaModel';

@Injectable({
  providedIn: 'root'
})
export class MarketValueDeltaService {

  constructor(
    private http: HttpClient
  ) { }

  getMarketValueDeltaData(asofdate: AsOfDateRange, newIssuerOrAsset: NewIssuerOrAsset){

    return of([])
  }

}
