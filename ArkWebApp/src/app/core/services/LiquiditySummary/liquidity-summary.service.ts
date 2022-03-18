import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { MsalUserService } from '../Auth/msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class LiquiditySummaryService {

  private httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
    })
  };

  constructor(private http: HttpClient,
              private msalService: MsalUserService) { }

              public getLiquiditySummaryPivoted(requestedDate: string, fundHedgings?: string[]){
    return this.http.get<any[]>(`${APIConfig.LIQUIDITY_SUMMARY_PIVOTED_GET_API}/?searchDate=${requestedDate}&fundHedgings=${fundHedgings}`, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )

  }
}
