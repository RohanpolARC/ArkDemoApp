import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { MonthlyReturnsCalcParams } from 'src/app/shared/models/IRRCalculationsModel';

@Injectable({
  providedIn: 'root'
})
export class MonthlyReturnsService {
  
  constructor(
    private http: HttpClient) { }

  public getMonthlyReturns(params: MonthlyReturnsCalcParams){

    return this.http.post<any>(APIConfig.MONTHLY_RETURNS_CALC_API, params).pipe(
      catchError((ex) => throwError(ex))
    )
  } 
}
