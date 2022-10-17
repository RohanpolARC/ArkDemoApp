import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';

@Injectable({
  providedIn: 'root'
})
export class AttributesFixingService {

  constructor(
    private http:HttpClient
  ) { }

  public getFixingDetails(){
    return this.http.get(`${APIConfig.FIXING_DETAILS_GET_API}`).pipe(
      catchError((ex) => throwError(ex))
  );
  }

  public getFixingTypes(){
    return this.http.get(`${APIConfig.FIXING_TYPES_GET_API}`).pipe(
      catchError((ex) => throwError(ex))
  );
  }

  public putFixingDetails(model){
    return this.http.post(`${APIConfig.FIXING_TYPES_PUT_API}`, model).pipe(
      catchError((ex) => throwError(ex))
  );
  }

  public deleteFixingDetails(fixingID:number){
    return this.http.post(`${APIConfig.FIXING_TYPES_DELETE_API}`, fixingID).pipe(
      catchError((ex) => throwError(ex))
  );
  }
}

