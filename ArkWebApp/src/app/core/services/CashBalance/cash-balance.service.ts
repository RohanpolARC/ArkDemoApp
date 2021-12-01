import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MsalUserService } from '../Auth/msaluser.service';  
import { AsOfDate } from 'src/app/shared/models/FilterPaneModel';

@Injectable({
  providedIn: 'root'
})
export class CashBalanceService {

  private CASH_BALANCE_GET_API = APIConfig.CASH_BALANCE_GET_API;

  httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json'  
    })
  };  

  constructor(private http: HttpClient,private msalService: MsalUserService) { }

  public getCashBalance(requestedDate: AsOfDate){
    this.httpOptions = {  
      headers: new HttpHeaders({  
          'Content-Type': 'application/json',  
          'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
      })};

    return this.http.get<any[]>(`${this.CASH_BALANCE_GET_API}/?startDate=${requestedDate.start}&endDate=${requestedDate.end}`, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }
}
