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
export class MarkChangesService {
  private searchDateRangeMessage = new BehaviorSubject<any>(null);
  currentSearchDateRange = this.searchDateRangeMessage.asObservable();
  changeSearchDateRange(range: AsOfDateRange){
      this.searchDateRangeMessage.next(range);
  }

  constructor(private http: HttpClient) { }

  public getMarkChanges(requestedDate: AsOfDateRange){
    return this.http.get<any[]>(`${APIConfig.MARK_CHANGES_GET_API}/?startDate=${requestedDate.start}&endDate=${requestedDate.end}`).pipe(catchError((ex) => throwError(ex)));
  }
}
