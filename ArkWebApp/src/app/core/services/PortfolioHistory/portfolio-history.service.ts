import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {AssetGIRModel} from '../../../shared/models/AssetGIRModel'
import { MsalUserService } from '../Auth/msaluser.service';  
import { DataService } from '../data.service';

@Injectable({
  providedIn: 'root'
})
export class PortfolioHistoryService {

  constructor(private http: HttpClient,private msalService: MsalUserService,private dataService:DataService) { }

  public getPortfolioHistory(){
    return this.http.get<any[]>(APIConfig.PORTFOLIO_HISTORY_GET_API).pipe(
      catchError((ex) => throwError(ex)));
  }

  public putAssetGIR(models: AssetGIRModel[]){
    return this.http.post<any>(APIConfig.PORTFOLIO_HISTORY_PUT_API, models).pipe(
      catchError((ex) => throwError(ex)));
  }

  public putAssetGIRReview(model:AssetGIRModel[]){
    return this.http.post<any>(APIConfig.PORTFOLIO_HISTORY_PUT_REVIEW_API,model).pipe(
      catchError((ex)=>throwError(ex))
    )
  }

  public deleteAssetGIR(assetGIRModel: AssetGIRModel){
    return this.http.post<any>(APIConfig.PORTFOLIO_HISTORY_DELETE_API, assetGIRModel).pipe(catchError((ex) => throwError(ex)));
  }

  public putBulkAssetGIR(bulkAssetGIRModel: AssetGIRModel []){
    return this.http.post<any>(APIConfig.PORTFOLIO_HISTORY_BULK_PUT_API, bulkAssetGIRModel).pipe(catchError((ex) => throwError(ex)));
  }

  public getModel(data:any):AssetGIRModel{
      // `this.data.rowData` holds the data of the selected row.

      let AssetGIR: AssetGIRModel = new AssetGIRModel();
      AssetGIR.WSOAssetid = data.assetId;
      AssetGIR.AsOfDate = data.asOfDate;
      AssetGIR.Ccy = 0;    // ?
      AssetGIR.Rate = (data.staging_FXRateBase===0)  ? null  : data.staging_FXRateBase;       // Updated GIR.
      AssetGIR.last_update = new Date();
      AssetGIR.CcyName = data.fundCcy;
      AssetGIR.Text = data.asset;
      AssetGIR.ModifiedBy = this.dataService.getCurrentUserInfo().name;
      AssetGIR.TradeDate = data.tradeDate;
      AssetGIR.FundHedging = data.fundHedging;
      
      AssetGIR.ModifiedOn = new Date();
      AssetGIR.CreatedBy = this.dataService.getCurrentUserInfo().name;
      AssetGIR.CreatedOn = new Date(); 
      AssetGIR.isReviewed = data.isReviewed

    return AssetGIR
  }

}