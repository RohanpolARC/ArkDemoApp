import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MsalUserService } from '../Auth/msaluser.service';  
import { CapitalActivityModel } from '../../../shared/models/CapitalActivityModel'

@Injectable({
  providedIn: 'root'
})
export class CapitalActivityService {

  private CAPITAL_ACTIVITY_PUT_API: string = APIConfig.CAPITAL_ACTIVITY_PUT_API;
  private CAPITAL_ACTIVITY_GET_API: string = APIConfig.CAPITAL_ACTIVITY_GET_API;
  private CAPITAL_ACTIVITY_GET_REF_API: string = APIConfig.CAPITAL_ACTIVITY_GET_REF_API;

  httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json'  
    })  
  };

  constructor(private http:HttpClient, private msalService: MsalUserService) { }

  public putCapitalActivity(capitalAct: CapitalActivityModel){

    this.httpOptions = {  
      headers: new HttpHeaders({  
          'Content-Type': 'application/json',  
          'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
      })  
    };
    return this.http.post<any>(this.CAPITAL_ACTIVITY_PUT_API, capitalAct, this.httpOptions).pipe(
      catchError((ex) => throwError(ex)));
  }

  public getCapitalActivity(){
    this.httpOptions = {  
      headers: new HttpHeaders({  
          'Content-Type': 'application/json',  
          'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
      })};
    return this.http.get<any>(this.CAPITAL_ACTIVITY_GET_API, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }

  public getCapitalRefData(){
    this.httpOptions = {  
      headers: new HttpHeaders({  
          'Content-Type': 'application/json',  
          'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
      })};
    return this.http.get<any>(this.CAPITAL_ACTIVITY_GET_REF_API, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }
}
