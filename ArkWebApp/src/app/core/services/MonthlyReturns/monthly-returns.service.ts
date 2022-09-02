import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { MonthlyReturnsCalcParams } from 'src/app/shared/models/IRRCalculationsModel';
import { MsalUserService } from '../Auth/msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class MonthlyReturnsService {

  private httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
    })
  };
  
  constructor(
    private http: HttpClient,
    private msalService: MsalUserService) { }

  public getMonthlyReturns(params: MonthlyReturnsCalcParams){

    return this.http.post<any>(APIConfig.MONTHLY_RETURNS_CALC_API, params, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )
  } 
}
