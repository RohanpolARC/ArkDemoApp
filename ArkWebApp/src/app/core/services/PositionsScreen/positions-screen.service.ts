import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { getMomentDateStr } from 'src/app/shared/functions/utilities';

@Injectable({
  providedIn: 'root'
})
export class PositionScreenService {

    private asOfDateMessage = new BehaviorSubject<string>(null)
    currentSearchDate = this.asOfDateMessage.asObservable();
    changeSearchDate(asOfDate: string){
        this.asOfDateMessage.next(asOfDate);
    }

  constructor(
    private http:HttpClient
  ) { }

  public getPositions(asOfDate){


    return this.http.get<any[]>(`${APIConfig.POSITIONS_GET_API}`,{
        params: new HttpParams().set('asOfDate',asOfDate)
    }).pipe(
      catchError((ex) => throwError(ex))
  );
  }



}