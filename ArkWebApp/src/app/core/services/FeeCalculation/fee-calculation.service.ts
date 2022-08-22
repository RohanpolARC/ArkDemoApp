import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { FeeCalcParams } from 'src/app/shared/models/FeeCalculationModel';
import { MsalUserService } from '../Auth/msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class FeeCalculationService {

  private httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
    })
  };

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
    private msalService: MsalUserService
  ) { }

  public getFeeCalculation(model: FeeCalcParams){
    return this.http.post<any>(`${APIConfig.FEE_RUN_CALCS_API}`, model, this.httpOptions)
                    .pipe(catchError((ex) => throwError(ex)))
  }

  public getFeeCalcStatus(uri: string){
    return this.http.get<any>(`${uri}`, this.httpOptions).pipe(catchError((ex) => throwError(ex)));
  }

}
