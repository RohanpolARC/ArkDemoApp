import { Injectable } from '@angular/core';
import { BehaviorSubject,  throwError } from 'rxjs';
import { catchError, } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient } from '@angular/common/http';
import {  IFilterPaneParams } from 'src/app/shared/models/FilterPaneModel';



@Injectable({
  providedIn: 'root'
})
export class GeneralFilterService {

  public filterValueChanges = new BehaviorSubject<any>(null)
  currentFilterValues = this.filterValueChanges.asObservable();
  changeFilterValues(values:IFilterPaneParams){
    this.filterValueChanges.next(values)
  }

 

  filterValues: IFilterPaneParams = {}

  constructor(
    private http:HttpClient
  ) { }

  getFilters(screen:string) {

    return this.http.get<any[]>(`${APIConfig.REFDATA_GET_FILTER_CONFIG_API}/?screen=${screen}`).pipe(catchError((ex)=>throwError(ex)));

  }

  emitFilterConfig(){
    this.changeFilterValues(this.filterValues)
  }
}
