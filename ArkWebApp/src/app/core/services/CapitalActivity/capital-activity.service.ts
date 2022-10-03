import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MsalUserService } from '../Auth/msaluser.service';  
import { AssociateInvestment, CapitalActivityModel, CapitalInvestment } from '../../../shared/models/CapitalActivityModel'

@Injectable({
  providedIn: 'root'
})
export class CapitalActivityService {

  constructor(private http:HttpClient, private msalService: MsalUserService) { }

  public putCapitalActivity(capitalAct: CapitalActivityModel){

    return this.http.post<any>(APIConfig.CAPITAL_ACTIVITY_PUT_API, capitalAct).pipe(
      catchError((ex) => throwError(ex)));
  }

  public bulkPutCapitalActivity(bulkCapitalAct: CapitalActivityModel[]){
    return this.http.post<any>(APIConfig.CAPITAL_ACTIVITY_BULK_PUT_API, bulkCapitalAct).pipe(catchError((ex) => throwError(ex)));
  }

  public lookUpCapitalActivity(capitalAct: CapitalActivityModel){
    return this.http.post<any>(APIConfig.CAPITAL_ACTIVITY_LOOKUP_API, capitalAct).pipe(
      catchError((ex) => throwError(ex)));
  }

  public associateCapitalInvestments(model: AssociateInvestment){
    return this.http.post<any>(APIConfig.CAPITAL_INVESTMENT_ASSOCIATE_API, model).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalActivity(){
    return this.http.get<any>(APIConfig.CAPITAL_ACTIVITY_GET_API).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalInvestment(capitalID?: number){
    if(!capitalID)
      capitalID = -1;
    return this.http.get<any>(`${APIConfig.CAPITAL_INVESTMENT_GET_API}/?capitalID=${capitalID}`).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalRefData(){
    return this.http.get<any>(APIConfig.CAPITAL_ACTIVITY_GET_REF_API).pipe(catchError((ex) => throwError(ex)));
  }
}
