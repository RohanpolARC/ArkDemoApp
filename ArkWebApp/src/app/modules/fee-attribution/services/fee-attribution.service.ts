import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';

@Injectable()
export class FeeAttributionService {

  private funds = new BehaviorSubject<string[]>([]);
  currentfundValues$ = this.funds.asObservable();
  changeFundValues(funds: string[]){
    this.funds.next(funds)
  }

  private asofdateRange = new BehaviorSubject<AsOfDateRange>(null);
  currentAsofdateRangeValues$ = this.asofdateRange.asObservable();
  changeAsofdateRange(asofdateR: AsOfDateRange){
    this.asofdateRange.next(asofdateR)
  }

  private asofdate = new BehaviorSubject<string>(null);
  currentAsofdateValue$ = this.asofdate.asObservable();
  changeAsofdate(asofdate: string){
    this.asofdate.next(asofdate)
  }
  constructor(private http: HttpClient) { }

  getFeeAttribution(asofdaterange: AsOfDateRange, asofdate: string, funds: string[]): Observable<any[]>{

    let req = {
      previousdate: asofdaterange.start,
      currentdate: asofdaterange.end,
      asofdate: asofdate,
      funds: funds
    }

    return this.http.post<any[]>(APIConfig.FEE_ATTRIBUTION_GET_API, req)
      .pipe(
        catchError((ex) => throwError(ex))
      )
  }
}
