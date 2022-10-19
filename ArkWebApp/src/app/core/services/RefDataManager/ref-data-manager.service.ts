import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';

@Injectable({
  providedIn: 'root'
})
export class RefDataManagerService {


  constructor(
    private http:HttpClient
  ) { }


  private filterTypeMessage = new BehaviorSubject<any>(null)
  currentFilterValues = this.filterTypeMessage.asObservable();
  public changeFilterValues(value: string[]){
      this.filterTypeMessage.next(value);
  }

  public putRefDataFixingTypes(model){
    return this.http.post(`${APIConfig.REF_DATA_FIXING_TYPES_PUT_API}`, model).pipe(
      catchError((ex) => throwError(ex))
  );
  }

  public getRefData(FilterValue){
    return this.http.get(`${APIConfig.FIXING_TYPES_GET_API}`,{
      params: new HttpParams().set('FilterValue', FilterValue)
  }).pipe(
      catchError((ex) => throwError(ex))
  );
  }

}
