import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Injectable({
  providedIn: 'root'
})
export class EqualisationService {
      
  constructor(private http: HttpClient) { }

  public getPositionCashflowsEqualised(requestedDate: string, funds:string): Observable<any[]>{
    return this.http.get<any[]>(`${APIConfig.EQUALISATION_POSITION_CASHFLOWS_GET_API}/?searchDate=${requestedDate}&funds=${funds}`).pipe(
      catchError((ex) => throwError(ex)));
  }


  public getPortfolioHistoryEqualised(asofdate: string) {
    return this.http.get<any[]>(`${APIConfig.EQUALISATION_PORTFOLIO_HISTORY_GET_API}`, {
      params: {
        'asofdate': asofdate
      }
    })
  } 

}