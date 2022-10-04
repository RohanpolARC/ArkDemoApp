import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { FeeCalcParams } from 'src/app/shared/models/FeeCalculationModel';
import { RESOURCE_CONTEXT } from '../../interceptors/msal-http.interceptor';

@Injectable({
  providedIn: 'root'
})
export class FeeCalculationService {

  private entityMessage = new BehaviorSubject<any>(null)
  currententityValue = this.entityMessage.asObservable();
  changeEntityValue(value: string){
      this.entityMessage.next(value);
  }

  private asOfDateMessage = new BehaviorSubject<string>(null)
  currentSearchDate = this.asOfDateMessage.asObservable();
  changeSearchDate(asOfDate: string){
      this.asOfDateMessage.next(asOfDate);
  }

  constructor(
    private http: HttpClient,
  ) { }

  public getFeeCalculation(model: FeeCalcParams){
    return this.http.post<any>(`${APIConfig.FEE_RUN_CALCS_API}`, model, { 
      context: new HttpContext().set(RESOURCE_CONTEXT, 'IRRCalculatorFunction') 
    }).pipe(catchError((ex) => throwError(ex)))
  }

  public getFeeCalcStatus(uri: string){
    return this.http.get<any>(`${uri}`, { 
      context: new HttpContext().set(RESOURCE_CONTEXT, 'IRRCalculatorFunction') 
    }).pipe(catchError((ex) => throwError(ex)))
}

}
