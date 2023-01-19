import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, throwError } from 'rxjs';
import { MsalUserService } from '../Auth/msaluser.service';  
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';

@Injectable({
  providedIn: 'root'
})
export class AumDeltaService {
  private searchDateRangeMessage = new BehaviorSubject<any>(null);
  currentSearchDateRange = this.searchDateRangeMessage.asObservable();
  changeSearchDateRange(range: AsOfDateRange){
      this.searchDateRangeMessage.next(range);
  }

  constructor(private http: HttpClient,private msalService: MsalUserService) { }

  public getAumDelta(requestedDate: AsOfDateRange){
    return this.http.get<any[]>(`${APIConfig.AUM_DELTA_GET_API}/?fromDate=${requestedDate.start}&toDate=${requestedDate.end}`).pipe(catchError((ex) => throwError(ex)));
  }
}
