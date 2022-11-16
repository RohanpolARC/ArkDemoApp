import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, throwError, timer } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { FeeCalcParams } from 'src/app/shared/models/FeeCalculationModel';
import { RESOURCE_CONTEXT } from '../../interceptors/msal-http.interceptor';

@Injectable({
  providedIn: 'root'
})
export class FeeCalculationService {

  subscriptions: Subscription[] = []
  feeSmy: any[] | null
  feeCashflows: any[] | null
  positionCashflows: any[] | null
  terminateUri: string
  closeTimer: Subject<any> = new Subject<any>();
  isCalculationLoaded: EventEmitter<{ feeSmy: any[] | null, feeCashflows: any[] | null }> = new EventEmitter();

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
      context: new HttpContext().set(RESOURCE_CONTEXT, 'FeeCalculatorFunction') 
    }).pipe(catchError((ex) => throwError(ex)))
  }

  public getFeeCalcStatus(uri: string){
    return this.http.get<any>(`${uri}`, { 
      context: new HttpContext().set(RESOURCE_CONTEXT, 'FeeCalculatorFunction') 
    }).pipe(catchError((ex) => throwError(ex)))
  }

  public terminateInstance(uri: string){
    return this.http.post<any>(`${uri}`, null, 
    { 
      context: new HttpContext().set(RESOURCE_CONTEXT, 'FeeCalculatorFunction') 
    }).pipe(catchError((ex) => throwError(ex)))
  }

  public fetchFeeCashflows(asOfDate: string, entity: string, positionIDs: number[] = null, runID = null){

    if(!asOfDate || !entity){
      console.warn(`Received something null -> AsOfDate: ${asOfDate} , Entity: ${entity}`)
      return;
    }

    this.feeSmy = this.feeCashflows = null
    this.subscriptions.push(this.getFeeCalculation({asOfDate: asOfDate, entity: entity, positionIDs: positionIDs, runID: runID}).subscribe({
    next: response => {

      this.terminateUri = response?.['terminatePostUri']
      timer(0, 10000).pipe(
        switchMap(() => this.getFeeCalcStatus(response?.['statusQueryGetUri'])),
        takeUntil(this.closeTimer)
      ).subscribe({
        next: (res: any) => {

          if(res?.['runtimeStatus'] === 'Terminated'){
            this.closeTimer.next();
          }
          else if(res?.['runtimeStatus'] === 'Completed'){
            this.feeCashflows = res?.['output']['FeeCashflows'][0]
            this.feeSmy = res?.['output']['FeeOutput']
            this.closeTimer.next();            
          }
          else if(res?.['runtimeStatus'] === 'Failed'){
            this.feeCashflows = []
            this.feeSmy = []
            this.closeTimer.next();
          }

          if(['Completed', 'Failed'].includes(res?.['runtimeStatus']))
            this.isCalculationLoaded.emit({
              feeCashflows: this.feeCashflows,
              feeSmy: this.feeSmy
            })
        }
      })
    },
    error: error => {
      console.error(`Failed to make fee calculation request: ${error}`);
      this.feeCashflows = []
      this.feeSmy = []

      this.isCalculationLoaded.emit({
        feeCashflows: this.feeCashflows,
        feeSmy: this.feeSmy
      })
    }
  }))

  }
}


