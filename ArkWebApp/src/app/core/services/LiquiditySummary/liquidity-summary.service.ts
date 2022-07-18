import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { MsalUserService } from '../Auth/msaluser.service';
import { LiquiditySummaryAttributeModel, LiquiditySummaryUpdateModel } from '../../../shared/models/LiquiditySummaryModel';
import { UnfundedAsset } from 'src/app/shared/models/UnfundedAssetModel';

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

    public getLiquiditySummaryPivoted(requestedDate: string, fundHedgings: string[], days: number){

      return this.http.get<any[]>(`${APIConfig.LIQUIDITY_SUMMARY_PIVOTED_GET_API}/?searchDate=${requestedDate}&fundHedgings=${fundHedgings}&days=${days}`, this.httpOptions).pipe(
        catchError((ex) => throwError(ex))
      )
    }

    public getLiquiditySummaryRef(){

      return this.http.get<any[]>(`${APIConfig.LIQUIDITY_SUMMARY_REF_GET_API}`, this.httpOptions).pipe(
        catchError((ex) => throwError(ex))
      )
    }

    public putLiquiditySummaryAttribute(model: LiquiditySummaryAttributeModel){

      return this.http.post<any>(APIConfig.LIQUIDITY_SUMMARY_PUT_API, model, this.httpOptions).pipe(
        catchError((ex) => throwError(ex))
      )
    }

    public updateLiquiditySummary(model: LiquiditySummaryUpdateModel){

      return this.http.post<any>(APIConfig.LIQUIDITY_SUMMARY_PUT_UPDATE_API, model, this.httpOptions).pipe(
        catchError((ex) => throwError(ex))
      )
    }
}
