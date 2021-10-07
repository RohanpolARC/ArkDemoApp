import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {AssetGIRModel} from '../../../shared/models/AssetGIRModel'
import { MsalUserService } from '../Auth/msaluser.service';  

@Injectable({
  providedIn: 'root'
})
export class PortfolioHistoryService {

  private PORTFOLIO_HISTORY_GET_API: string = APIConfig.PORTFOLIO_HISTORY_GET_API;
  private PORTFOLIO_HISTORY_PUT_API: string = APIConfig.PORTFOLIO_HISTORY_PUT_API;

  httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json'  
    })  
};  

  constructor(private http: HttpClient,private msalService: MsalUserService  ) {

   }

   public getPortfolioHistory(){

    this.httpOptions = {  
      headers: new HttpHeaders({  
          'Content-Type': 'application/json',  
          'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
      })  

  };

    return this.http.get<any[]>(this.PORTFOLIO_HISTORY_GET_API,this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
      );
  }

  public putAssetGIR(assetGIRModel:AssetGIRModel){

    this.httpOptions = {  
      headers: new HttpHeaders({  
          'Content-Type': 'application/json',  
          'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
      })  

  };



  return  this.http.post<any>(this.PORTFOLIO_HISTORY_PUT_API,assetGIRModel,this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
      );

  }






}
