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

  public getAUMReportMasterRows(requestedDate: AsOfDateRange,funds: String[]){
    let fundString = ''
    funds.forEach((fund:string) =>{
      fundString += fund + ','
    })

    return this.http.get<any[]>(`${APIConfig.AUM_REPORT_GET_API}/?fromDate=${requestedDate.start}&toDate=${requestedDate.end}&funds=${fundString.slice(0,fundString.length-1)}`).pipe(catchError((ex) => throwError(ex)));
  }
  public getAUMReportDetailRows(requestedDate: AsOfDateRange, issuerShortName: string,funds: String[]){
    let fundString = ''
    funds.forEach((fund:string) =>{
      fundString += fund + ','
    })

    return this.http.get<any[]>(`${APIConfig.AUM_REPORT_GET_API}/?fromDate=${requestedDate.start}&toDate=${requestedDate.end}&IssuerShortName=${encodeURIComponent(issuerShortName)}&funds=${fundString.slice(0,fundString.length-1)}`).pipe(catchError((ex) => throwError(ex)));
  }

}
