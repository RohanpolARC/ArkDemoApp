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
export class AumReportService {

  private searchDateRangeMessage = new BehaviorSubject<any>(null);
  currentSearchDateRange = this.searchDateRangeMessage.asObservable();
  changeSearchDateRange(range: AsOfDateRange){
      this.searchDateRangeMessage.next(range);
  }
  constructor(private http: HttpClient,private msalService: MsalUserService) { }

  public getAUMReportMasterRows(requestedDate: AsOfDateRange){
    return this.http.get<any[]>(`${APIConfig.AUM_REPORT_GET_API}/?fromDate=${requestedDate.start}&toDate=${requestedDate.end}`).pipe(catchError((ex) => throwError(ex)));
  }
  public getAUMReportDetailRows(requestedDate: AsOfDateRange, issuerShortName: string){
    return this.http.get<any[]>(`${APIConfig.AUM_REPORT_GET_API}/?fromDate=${requestedDate.start}&toDate=${requestedDate.end}&IssuerShortName=${issuerShortName}`).pipe(catchError((ex) => throwError(ex)));
  }

}
