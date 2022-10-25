import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { RefDataProc } from 'src/app/shared/models/GeneralModel';

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

  public putRefData(model){
    return this.http.post(`${APIConfig.REF_DATA_FIXING_TYPES_PUT_API}`, model).pipe(
      catchError((ex) => throwError(ex))
  );
  }

  public getRefData(FilterValue){
    return this.http.get<any[]>(`${APIConfig.FIXING_TYPES_GET_API}`,{
      params: new HttpParams().set('FilterValue', FilterValue)
  }).pipe(
      catchError((ex) => throwError(ex))
  );
  }

  public deleteRefData(refDataProcParams: RefDataProc){
    return this.http.post<any[]>(`${APIConfig.REF_DATA_DELETE_API}`,refDataProcParams).pipe(
      catchError((ex)=>throwError(ex))
    );
  }

}
