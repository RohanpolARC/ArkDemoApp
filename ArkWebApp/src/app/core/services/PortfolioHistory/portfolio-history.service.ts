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

  constructor(private http: HttpClient,private msalService: MsalUserService) { }

  public getPortfolioHistory(){
    return this.http.get<any[]>(APIConfig.PORTFOLIO_HISTORY_GET_API).pipe(
      catchError((ex) => throwError(ex)));
  }

  public putAssetGIR(models: AssetGIRModel[]){
    return this.http.post<any>(APIConfig.PORTFOLIO_HISTORY_PUT_API, models).pipe(
      catchError((ex) => throwError(ex)));
  }

  public deleteAssetGIR(assetGIRModel: AssetGIRModel){
    return this.http.post<any>(APIConfig.PORTFOLIO_HISTORY_DELETE_API, assetGIRModel).pipe(catchError((ex) => throwError(ex)));
  }

  public putBulkAssetGIR(bulkAssetGIRModel: AssetGIRModel []){
    return this.http.post<any>(APIConfig.PORTFOLIO_HISTORY_BULK_PUT_API, bulkAssetGIRModel).pipe(catchError((ex) => throwError(ex)));
  }
}