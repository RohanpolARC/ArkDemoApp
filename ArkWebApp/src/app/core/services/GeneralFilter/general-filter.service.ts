import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient } from '@angular/common/http';
import { FilterValueChangeParams } from 'src/app/shared/models/FilterPaneModel';


@Injectable({
  providedIn: 'root'
})
export class GeneralFilterService {

  private filterValueChanges = new BehaviorSubject<any>(null)
  currentFilterValues = this.filterValueChanges.asObservable();
  changeFilterValues(values:FilterValueChangeParams){
    this.filterValueChanges.next(values)
  }

  constructor(
    private http:HttpClient
  ) { }

  getFilters(screen:string) {

    return this.http.get<any[]>(`${APIConfig.REFDATA_GET_FILTER_CONFIG_API}/?screen=${screen}`).pipe(catchError((ex)=>throwError(ex)));

  }
}
