import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
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

  constructor(private http: HttpClient,
              private msalService: MsalUserService) { }

  public getFacilityDetails(){
    return this.http.get<any[]>(`${APIConfig.FACILITY_DETAILS_GET_API}`, this.httpOptions).pipe(
      catchError((ex) => throwError(ex)));
  }

  public putFacilityDetails(model: FacilityDetailModel){
    return this.http.post<any>(`${APIConfig.FACILITY_DETAILS_PUT_API}`, model, this.httpOptions).pipe(
      catchError((ex) => throwError(ex)));
  }
}
