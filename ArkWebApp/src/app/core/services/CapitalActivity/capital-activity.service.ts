import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MsalUserService } from '../Auth/msaluser.service';  
import { CapitalActivityModel, CapitalInvestment } from '../../../shared/models/CapitalActivityModel'

@Injectable({
  providedIn: 'root'
})
export class CapitalActivityService {

  private CAPITAL_ACTIVITY_PUT_API: string = APIConfig.CAPITAL_ACTIVITY_PUT_API;
  private CAPITAL_ACTIVITY_GET_API: string = APIConfig.CAPITAL_ACTIVITY_GET_API;
  private CAPITAL_ACTIVITY_GET_REF_API: string = APIConfig.CAPITAL_ACTIVITY_GET_REF_API;

  private CAPITAL_INVESTMENT_GET_API: string = APIConfig.CAPITAL_INVESTMENT_GET_API;
  private CAPITAL_INVESTMENT_ASSOCIATE_API: string = APIConfig.CAPITAL_INVESTMENT_ASSOCIATE_API;

  private CAPITAL_ACTIVITY_LOOKUP_API: string = APIConfig.CAPITAL_ACTIVITY_LOOKUP_API;
  private CAPITAL_ACTIVITY_BULK_PUT_API: string = APIConfig.CAPITAL_ACTIVITY_BULK_PUT_API;

  httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
    })  
  };

  constructor(private http:HttpClient, private msalService: MsalUserService) { }

  public putCapitalActivity(capitalAct: CapitalActivityModel){

    return this.http.post<any>(this.CAPITAL_ACTIVITY_PUT_API, capitalAct, this.httpOptions).pipe(
      catchError((ex) => throwError(ex)));
  }

  public bulkPutCapitalActivity(bulkCapitalAct: CapitalActivityModel[]){
    return this.http.post<any>(this.CAPITAL_ACTIVITY_BULK_PUT_API, bulkCapitalAct, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }

  public lookUpCapitalActivity(capitalAct: CapitalActivityModel){
    return this.http.post<any>(this.CAPITAL_ACTIVITY_LOOKUP_API, capitalAct, this.httpOptions).pipe(
      catchError((ex) => throwError(ex)));
  }

  public associateCapitalInvestments(investments: CapitalInvestment[]){
    return this.http.post<any>(this.CAPITAL_INVESTMENT_ASSOCIATE_API, investments, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalActivity(){
    return this.http.get<any>(this.CAPITAL_ACTIVITY_GET_API, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalInvestment(capitalID?: number){
    if(!capitalID)
      capitalID = -1;
    return this.http.get<any>(`${this.CAPITAL_INVESTMENT_GET_API}/?capitalID=${capitalID}`, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalRefData(){
    return this.http.get<any>(this.CAPITAL_ACTIVITY_GET_REF_API, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }
}
