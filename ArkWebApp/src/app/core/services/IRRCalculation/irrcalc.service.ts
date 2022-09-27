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
  
  private asOfDateMessage = new BehaviorSubject<string>(null)
  currentSearchDate = this.asOfDateMessage.asObservable();
  changeSearchDate(asOfDate: string){
      this.asOfDateMessage.next(asOfDate);
  }

  constructor(private http: HttpClient,
    private msalService: MsalUserService) { }

  public getIRRPositions(requestedDate: string, modelID?: number){
    return this.http.get<any[]>(`${APIConfig.IRR_POSITIONS_GET_API}/?searchDate=${requestedDate}&modelId=${modelID}`, this.httpOptions).pipe(
      catchError((ex) => throwError(ex)));
  }

  public putPortfolioModels(model: VPortfolioModel){
    return this.http.post<any>(`${APIConfig.IRR_PORTFOLIO_MODEL_PUT_API}`, model, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    );
  }

  public getPortfolioModels(userName: string){
    return this.http.get<any>(`${APIConfig.IRR_PORTFOLIO_MODEL_GET_API}/?userName=${userName}`, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  public getLocalOverrides(modelID: number){
    return this.http.get<any>(`${APIConfig.IRR_LOCAL_OVERRIDES_GET_API}/?modelID=${modelID}`, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  public getIRRCalculation(model: IRRCalcParams){
//    return this.http.post<any>(`${APIConfig.IRR_CALCS_GET_API}`, model, this.httpOptions).pipe(catchError((ex) => throwError(ex)))

return this.http.post<any>(`${APIConfig.IRR_RUN_CALCS_API}`, model, this.httpOptions)
.pipe(catchError((ex) => throwError(ex)))
  }

  public getIRRStatus(uri: string){
    return this.http.get<any>(`${uri}`, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }
}