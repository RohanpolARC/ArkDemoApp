import { HttpClient, HttpContext, HttpContextToken, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { IRRCalcParams, VPortfolioModel } from 'src/app/shared/models/IRRCalculationsModel';
import { BehaviorSubject } from 'rxjs';
import { RESOURCE_CONTEXT } from '../../interceptors/msal-http.interceptor';
import { LoadStatusType } from 'src/app/modules/irr-calculation/portfolio-modeller/portfolio-modeller.component';
import { ParentTabType } from 'src/app/modules/irr-calculation/irr-calculation.component';

@Injectable({
  providedIn: 'root'
})
export class IRRCalcService {

  parentTabs: ParentTabType[] = [{
    parentDisplayName: 'Portfolio Modeller',
    parentActualName: 'Portfolio Modeller',
    status: 'Loaded',
    tabset: [{
      displayName: 'Portfolio Modeller',
      status: 'Loaded',
      resultType: 'PortfolioModeller'
    }]
  }]

  // Mapping the cashflow load status against it's runID for result based tabs to trigger the corresponding calculation engine. 
  cashflowStatusMap: { 
    [RunID: string]: LoadStatusType
  }
  
  cashflowLoadStatusEvent: EventEmitter<{ runID: string, status: LoadStatusType }> = new EventEmitter();

  private asOfDateMessage = new BehaviorSubject<string>(null)
  currentSearchDate = this.asOfDateMessage.asObservable();
  changeSearchDate(asOfDate: string){
      this.asOfDateMessage.next(asOfDate);
  }

  constructor(private http: HttpClient) { }

  public getIRRPositions(requestedDate: string, modelID?: number){
    return this.http.get<any[]>(`${APIConfig.IRR_POSITIONS_GET_API}/?searchDate=${requestedDate}&modelId=${modelID}`).pipe(
      catchError((ex) => throwError(ex)));
  }

  public putPortfolioModels(model: VPortfolioModel){
    return this.http.post<any>(`${APIConfig.IRR_PORTFOLIO_MODEL_PUT_API}`, model).pipe(
      catchError((ex) => throwError(ex))
    );
  }

  public getPortfolioModels(userName: string){
    return this.http.get<any>(`${APIConfig.IRR_PORTFOLIO_MODEL_GET_API}/?userName=${userName}`).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  public getLocalOverrides(modelID: number){
    return this.http.get<any>(`${APIConfig.IRR_LOCAL_OVERRIDES_GET_API}/?modelID=${modelID}`).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  public getIRRCalculation(model: IRRCalcParams){
    return this.http.post<any>(`${APIConfig.IRR_RUN_CALCS_API}`, model, 
                { 
                  context: new HttpContext().set(RESOURCE_CONTEXT, 'IRRCalculatorFunction') 
                }).pipe(catchError((ex) => throwError(ex)))
  }

  public getIRRStatus(uri: string){
    return this.http.get<any>(`${uri}`, 
                { 
                  context: new HttpContext().set(RESOURCE_CONTEXT, 'IRRCalculatorFunction') 
                }).pipe(catchError((ex) => throwError(ex)));
  }

  public getPositionCashflows(model: IRRCalcParams){
    return this.http.post<any>(`${APIConfig.POSITION_CASHFLOWS_RUN_CALCS_API}`, model, 
    { 
      context: new HttpContext().set(RESOURCE_CONTEXT, 'IRRCalculatorFunction') 
    }).pipe(catchError((ex) => throwError(ex)))
  }

}