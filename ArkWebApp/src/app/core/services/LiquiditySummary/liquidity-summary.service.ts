import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { MsalUserService } from '../Auth/msaluser.service';
import { LiquiditySummaryAttributeModel, LiquiditySummaryUpdateModel } from '../../../shared/models/LiquiditySummaryModel';

@Injectable({
  providedIn: 'root'
})
export class LiquiditySummaryService {

  private fundHedgingMessage = new BehaviorSubject<any>(null)
  currentfundHedgingValues = this.fundHedgingMessage.asObservable();
  changeFundHedgingValues(values: string[]){
      this.fundHedgingMessage.next(values);
  }

  private asOfDateMessage = new BehaviorSubject<string>(null)
  currentSearchDate = this.asOfDateMessage.asObservable();
  changeSearchDate(asOfDate: string){
      this.asOfDateMessage.next(asOfDate);
  }

  private noofdaysMessage = new BehaviorSubject<number>(null)
  currentnoofdaysValues = this.noofdaysMessage.asObservable();
  changenoofdaysValues(value: number){
      this.noofdaysMessage.next(value);
  }

  constructor(private http: HttpClient,
              private msalService: MsalUserService) { }

    public getLiquiditySummaryPivoted(requestedDate: string, fundHedgings: string[], days: number){

      return this.http.get<any[]>(`${APIConfig.LIQUIDITY_SUMMARY_PIVOTED_GET_API}/?searchDate=${requestedDate}&fundHedgings=${fundHedgings}&days=${days}`).pipe(
        catchError((ex) => throwError(ex))
      )
    }

    public getLiquiditySummaryRef(){

      return this.http.get<any[]>(`${APIConfig.LIQUIDITY_SUMMARY_REF_GET_API}`).pipe(
        catchError((ex) => throwError(ex))
      )
    }

    public putLiquiditySummaryAttribute(model: LiquiditySummaryAttributeModel){

      return this.http.post<any>(APIConfig.LIQUIDITY_SUMMARY_PUT_API, model).pipe(
        catchError((ex) => throwError(ex))
      )
    }

    public deleteLiquiditySummaryAttribute(id:Number){

      return this.http.post<any>(APIConfig.LIQUIDITY_SUMMARY_DELETE_API, id).pipe(
        catchError((ex) => throwError(ex))
      )
    }

    public updateLiquiditySummary(model: LiquiditySummaryUpdateModel){

      return this.http.post<any>(APIConfig.LIQUIDITY_SUMMARY_PUT_UPDATE_API, model).pipe(
        catchError((ex) => throwError(ex))
      )
    }
}
