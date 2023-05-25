import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { APIReponse } from 'src/app/shared/models/GeneralModel';
import { Valuation } from 'src/app/shared/models/ValuationModel';

@Injectable({
  providedIn: 'root'
})
export class ValuationService {

  private asOfDate = new BehaviorSubject<string>(null);
  currentAsOfDate = this.asOfDate.asObservable();

  changeAsOfDate(asofdate: string){
    this.asOfDate.next(asofdate);
  }

  private fundsMessage = new BehaviorSubject<any>(null)
  currentfundValues = this.fundsMessage.asObservable();
  
  changeFundValues(values: string[]){
      this.fundsMessage.next(values);
  }

  getValuationData(asofdate: string, funds: string){
    return this.http.get<any[]>(`${APIConfig.VALUATION_DATA_GET_API}/?asofdate=${asofdate}&funds=${funds}`).pipe(
      catchError((ex) => throwError(ex))
    )
  }

  putValuationData(models: Valuation[]){
    return this.http.post<APIReponse>(`${APIConfig.VALUATION_DATA_PUT_API}`, models);
  }

  constructor(private http: HttpClient) { }
}