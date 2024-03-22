import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';
import { MarketValueDeltaModel } from 'src/app/shared/models/MarketValueDeltaModel';

@Injectable({
  providedIn: 'root'
})
export class MarketValueDeltaService {

  constructor(
    private http: HttpClient
  ) { }

  getMarketValueDeltaData(asofdate: AsOfDateRange, newIssuerOrAsset: string){
    return this.http.get<MarketValueDeltaModel[]>(
      `${APIConfig.MARKET_VALUE_DELTA_GET_API}/?prevdate=${asofdate.start}&currentdate=${asofdate.end}&newIssuerOrAsset=${newIssuerOrAsset}`).pipe(
      catchError((ex) => throwError(ex))
    )
  }

}
