import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { RESOURCE_CONTEXT } from '../../interceptors/msal-http.interceptor';

@Injectable({
  providedIn: 'root'
})
export class NetReturnsService {

  private fundHedgingMessage = new BehaviorSubject<any>(null)
  currentfundHedgingValues = this.fundHedgingMessage.asObservable();

  private calcMethodMessage = new BehaviorSubject<any>(null)
  currentCalcMethod = this.calcMethodMessage.asObservable();

  private cashflowTypeMessage = new BehaviorSubject<any>(null)
  currentCashflowType = this.cashflowTypeMessage.asObservable();

  private asOfDateMessage = new BehaviorSubject<string>(null)
  currentSearchDate = this.asOfDateMessage.asObservable();

  private saveNetReturns = new BehaviorSubject<any>(null)
  currentSaveNetReturns = this.saveNetReturns.asObservable();
  
  constructor(private http: HttpClient) { }

  changeFundHedgingValues(values: string){
    this.fundHedgingMessage.next(values);
  }

  changeSearchDate(asOfDate: string){
    this.asOfDateMessage.next(asOfDate);
  }

  changeCalcMethod(method: string){
    this.calcMethodMessage.next(method);
  }

  changeCashflowType(cashflowType: string){
    this.cashflowTypeMessage.next(cashflowType);
  }

  changeSaveNetReturns(saveNetReturns:any){
    this.saveNetReturns.next(saveNetReturns);
  }

  calculateNetIRR(
      model: {
        asOfDate: string, 
        fundHedging: string, 
        calcMethod: string,
        cashflowType: string,
        saveNetReturns: any,
        runBy:string
      }
    ): Observable<any[]>{
    return this.http.post<any[]>(
      `${APIConfig.FUNDHEDGING_NET_IRR_POST_API}`, model, 
      {
        context: new HttpContext().set(RESOURCE_CONTEXT, 'IRRCalculatorFunction')
      }).pipe(catchError((ex) => throwError(ex)));
  }

  getIRRStatus(uri: string){
    return this.http.get<any>(`${uri}`, 
      { 
        context: new HttpContext().set(RESOURCE_CONTEXT, 'IRRCalculatorFunction') 
      }).pipe(catchError((ex) => throwError(ex)));
  }

}
