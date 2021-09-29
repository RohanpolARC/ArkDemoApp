import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioHistoryService {

  private PORTFOLIO_HISTORY_GET_API: string = APIConfig.PORTFOLIO_HISTORY_GET_API;
  private PORTFOLIO_HISTORY_PUT_API: string = APIConfig.PORTFOLIO_HISTORY_PUT_API;

  constructor(private http: HttpClient) {

   }

   public getPortfolioHistory(){
    return this.http.get<any[]>(this.PORTFOLIO_HISTORY_GET_API).pipe(
      catchError((ex) => throwError(ex))
      );
  }






}
