import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIConfig } from 'src/app/configs/api-config';

@Injectable({
  providedIn: 'root'
})
export class CashFlowService {

  constructor(
    private http: HttpClient
  ) { }

  public getCashFlows(runID: string): Observable<any>{

    return this.http.get<any>(`${APIConfig.PORTFOLIO_CASHFLOWS_GET_API}`, {
      params: {
        runID: runID
      }
    })
  } 
}
