import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { FacilityDetailModel } from 'src/app/shared/models/FacilityDetailModel';
import { MsalUserService } from '../Auth/msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class FacilityDetailService {

  private httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
    })
  };

  private fundsMessage = new BehaviorSubject<any>(null)
  currentfundValues = this.fundsMessage.asObservable();
  changeFundValues(values: string[]){
      this.fundsMessage.next(values);
  }

  private asOfDateMessage = new BehaviorSubject<string>(null)
  currentSearchDate = this.asOfDateMessage.asObservable();
  changeSearchDate(asOfDate: string){
      this.asOfDateMessage.next(asOfDate);
  }

  constructor(private http: HttpClient,
              private msalService: MsalUserService) { }

  public getFacilityDetails(funds: string[], asOfDate?: string){
    return this.http.get<any[]>(`${APIConfig.FACILITY_DETAILS_GET_API}/?funds=${funds}&asOfDate=${asOfDate}`, this.httpOptions).pipe(
      catchError((ex) => throwError(ex)));
  }

  public putFacilityDetails(model: FacilityDetailModel){
    return this.http.post<any>(`${APIConfig.FACILITY_DETAILS_PUT_API}`, model, this.httpOptions).pipe(
      catchError((ex) => throwError(ex)));
  }
}
