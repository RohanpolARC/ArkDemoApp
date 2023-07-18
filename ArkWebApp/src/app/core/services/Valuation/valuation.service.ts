import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';
import { APIReponse } from 'src/app/shared/models/GeneralModel';
import { SpreadBenchmarkIndex, Valuation, YieldCurve } from 'src/app/shared/models/ValuationModel';
import { RESOURCE_CONTEXT } from '../../interceptors/msal-http.interceptor';

@Injectable({
  providedIn: 'root'
})
export class ValuationService {

  private fundsMessage = new BehaviorSubject<any>(null)
  currentfundValues = this.fundsMessage.asObservable();
  
  changeFundValues(values: string[]){
    this.fundsMessage.next(values);
  }

  private markType = new BehaviorSubject<string[]>(null)
  currentMarkTypes = this.markType.asObservable();

  changeMarkType(values: string[]){
    this.markType.next(values)
  }
  
  private searchDateRangeMessage = new BehaviorSubject<any>(null);
  currentSearchDateRange = this.searchDateRangeMessage.asObservable();
  
  changeSearchDateRange(range: AsOfDateRange){
      this.searchDateRangeMessage.next(range);
  }

  getValuationData(asofdate: AsOfDateRange, funds: string, marktypes: string){
    return this.http.get<any[]>(
      `${APIConfig.VALUATION_DATA_GET_API}/?prevdate=${asofdate.start}&currentdate=${asofdate.end}&funds=${funds}&marktypes=${marktypes}`).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  getSpreadBenchmarkIndex(asofdate: string, benchmarkindex: string){
    return this.http.get<SpreadBenchmarkIndex[]>(`${APIConfig.VALUATION_SPREAD_BENCHMARK_INDEXES_GET_API}/?asofdate=${asofdate}&benchmarkindex=${benchmarkindex ?? ''}`).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  getYieldCurves(asofdate: string){
    return this.http.get<YieldCurve[]>(`${APIConfig.VALUATION_YIELD_CURVES_GET_API}/?asofdate=${asofdate}`).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  getAuditMaster(assetID: number, marktype: string, asofdate: string){
    return this.http.get<any[]>(`${APIConfig.VALUATION_AUDIT_MASTER_GET_API}`, {
      params: {
        assetID: assetID ?? '', marktype: marktype ?? '', asofdate: asofdate ?? ''
      }
    }).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  getAuditDetail(assetID: number, marktype: string, asofdate: string, auditeventID: number){
    return this.http.get<any[]>(`${APIConfig.VALUATION_AUDIT_DETAIL_GET_API}/?assetID=${assetID}&marktype=${marktype}&asofdate=${asofdate}&auditeventID=${auditeventID}`).pipe(
      catchError((ex) => throwError(ex))
    );
  }

  putValuationData(models: Valuation[]){
    return this.http.post<APIReponse>(`${APIConfig.VALUATION_DATA_PUT_API}`, models);
  }

  putReviewingAssets(model){
    return this.http.post<any[]>(`${APIConfig.VALUATION_REVIEWING_ASSETS_PUT_API}`, model);
  }

  runModelValuations(model: {asOfDate: string, assetID: number[]}): Observable<any[]>{
    return this.http.post<any[]>(
      `${APIConfig.RUN_MODEL_VALUATION_API}`, model, 
      {
        context: new HttpContext().set(RESOURCE_CONTEXT, 'IRRCalculatorFunction')
      }).pipe(catchError((ex) => throwError(ex)));
  }
    
  getStatus(uri: string){
    return this.http.get<any>(`${uri}`, 
      { 
        context: new HttpContext().set(RESOURCE_CONTEXT, 'IRRCalculatorFunction') 
      }).pipe(catchError((ex) => throwError(ex)));
  }

  constructor(private http: HttpClient) { }
}