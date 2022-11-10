import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { CashFlowParams } from 'src/app/shared/models/IRRCalculationsModel';
import { MsalUserService } from '../Auth/msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class CashFlowService {

  constructor(
    private http: HttpClient,
    private msalService: MsalUserService) { }

  public getCashFlows(params: CashFlowParams){

    // return this.http.post<any>(APIConfig.MONTHLY_RETURNS_CALC_API, params).pipe(
    //   catchError((ex) => throwError(ex))
    // )
  } 
}
