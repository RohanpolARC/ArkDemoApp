import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { PortfolioMapping, PortfolioMappingApproval } from 'src/app/shared/models/PortfolioManagerModel';
import { MsalUserService } from '../Auth/msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class PortfolioManagerService {

  private httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
    })
  };

  constructor(
    private http: HttpClient,
    private msalService: MsalUserService
    ) { }

  public getPortfolioMapping(){

    return this.http.get<any>(APIConfig.PORTFOLIO_MAPPING_GET_API, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  public getPortfolioMappingStaging(){

    return this.http.get<any>(APIConfig.PORTFOLIO_MAPPING_STAGING_GET_API, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  public putPortfolioMapping(model: PortfolioMapping){

    return this.http.post<any>(APIConfig.PORTFOLIO_MAPPING_PUT_API, model, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  public putPortfolioMappingApproval(model: PortfolioMappingApproval){

    return this.http.post<any>(APIConfig.PORTFOLIO_MAPPING_APPROVAL_PUT_API, model, this.httpOptions).pipe(
      catchError((ex) => throwError(ex))
    )
  }
}
