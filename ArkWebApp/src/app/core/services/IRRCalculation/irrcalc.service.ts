import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { IRRCalcParams, VPortfolioModel } from 'src/app/shared/models/IRRCalculationsModel';
import { MsalUserService } from '../Auth/msaluser.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IRRCalcService {
  private httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
    })
  };
  
  constructor(private http: HttpClient,
    private msalService: MsalUserService) { }

  public getIRRPositions(requestedDate: string){
    return this.http.get<any[]>(`${APIConfig.IRR_POSITIONS_GET_API}/?searchDate=${requestedDate}`, this.httpOptions).pipe(
      catchError((ex) => throwError(ex)));
  }

  public putPortfolioModels(model: VPortfolioModel){
    return this.http.post<any>(`${APIConfig.IRR_PORTFOLIO_MODEL_PUT_API}`, model, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    );
  }

  public getPortfolioModels(){
    return this.http.get<any>(`${APIConfig.IRR_PORTFOLIO_MODEL_GET_API}`, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  public getLocalOverrides(modelID: number){
    return this.http.get<any>(`${APIConfig.IRR_LOCAL_OVERRIDES_GET_API}/?modelID=${modelID}`, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  public getIRRCalculation(model: IRRCalcParams){
    return this.http.post<any>(`${APIConfig.IRR_CALCS_GET_API}`, model, this.httpOptions).pipe(catchError((ex) => throwError(ex)))
  }

  private calcSource = new BehaviorSubject(null);
  currentCalcs = this.calcSource.asObservable();
  updateCalcParams(calcs){
    this.calcSource.next(calcs);
  }  
}