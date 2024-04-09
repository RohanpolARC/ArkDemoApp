import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Injectable({
  providedIn: 'root'
})
export class PortfolioPositionCashflowService {
   
  constructor(private http: HttpClient) { } 

  public getPositionCashflows(requestedDate: string, type: string) {
    return this.http.get<any[]>(`${APIConfig.POSITION_CASHFLOWS_GET_API}`, {
      params: {
        'searchDate': requestedDate,
        'type' : type
      }
    })
  }

}