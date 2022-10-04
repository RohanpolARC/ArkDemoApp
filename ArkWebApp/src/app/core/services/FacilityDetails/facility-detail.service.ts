import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { FacilityDetailModel } from 'src/app/shared/models/FacilityDetailModel';
import { MsalUserService } from '../Auth/msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class FacilityDetailService {

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
    return this.http.get<any[]>(`${APIConfig.FACILITY_DETAILS_GET_API}/?funds=${funds}&asOfDate=${asOfDate}`).pipe(
      catchError((ex) => throwError(ex)));
  }

  public putFacilityDetails(model: FacilityDetailModel){
    return this.http.post<any>(`${APIConfig.FACILITY_DETAILS_PUT_API}`, model).pipe(
      catchError((ex) => throwError(ex)));
  }
}
