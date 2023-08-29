import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { AssociateInvestment, CapitalActivityModel, CapitalInvestment, INAVQuarterly } from '../../../shared/models/CapitalActivityModel'
import { APIReponse } from 'src/app/shared/models/GeneralModel';

@Injectable()
export class CapitalActivityService {

  constructor(private http:HttpClient) { }

  private linkSubject = new Subject<boolean>();
  linkEvent$ = this.linkSubject.asObservable();
  updateLinkEvent(link: boolean){
    this.linkSubject.next(link);
  }

  public putCapitalActivity(capitalAct: CapitalActivityModel){

    return this.http.post<APIReponse>(APIConfig.CAPITAL_ACTIVITY_PUT_API, capitalAct).pipe(
      catchError((ex) => throwError(ex)));
  }

  public bulkPutCapitalActivity(bulkCapitalAct: CapitalActivityModel[]){
    return this.http.post<any>(APIConfig.CAPITAL_ACTIVITY_BULK_PUT_API, bulkCapitalAct).pipe(catchError((ex) => throwError(ex)));
  }

  public putNAVQuarterly(navQuarterlies: INAVQuarterly[]){
    return this.http.post<APIReponse>(APIConfig.NAV_QUARTERLY_PUT_API, navQuarterlies).pipe(catchError((ex) => throwError(ex)));
  }
  public lookUpCapitalActivity(capitalAct: CapitalActivityModel){
    return this.http.post<any[]>(APIConfig.CAPITAL_ACTIVITY_LOOKUP_API, capitalAct).pipe(
      catchError((ex) => throwError(ex)));
  }

  public associateCapitalInvestments(model: AssociateInvestment){
    return this.http.post<APIReponse>(APIConfig.CAPITAL_INVESTMENT_ASSOCIATE_API, model).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalActivity(){
    return this.http.get<CapitalActivityModel[]>(APIConfig.CAPITAL_ACTIVITY_GET_API).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalInvestment(capitalID?: number){
    if(!capitalID)
      capitalID = -1;
    return this.http.get<CapitalInvestment[]>(`${APIConfig.CAPITAL_INVESTMENT_GET_API}/?capitalID=${capitalID}`).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalRefData(){
    return this.http.get<any>(APIConfig.CAPITAL_ACTIVITY_GET_REF_API).pipe(catchError((ex) => throwError(ex)));
  }
}
