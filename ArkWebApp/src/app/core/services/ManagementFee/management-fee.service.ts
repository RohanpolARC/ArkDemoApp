import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APIConfig } from 'src/app/configs/api-config';

@Injectable({
  providedIn: 'root'
})
export class ManagementFeeService {

  private asOfDateMessage = new BehaviorSubject<string>(null)
  currentSearchDate = this.asOfDateMessage.asObservable();
  changeSearchDate(asOfDate: string){
      this.asOfDateMessage.next(asOfDate);
  }
  
  constructor(private http:HttpClient) { }

  public getManagementFee(asOfDate: string){
    return this.http.get(`${APIConfig.MANAGEMENT_FEE_GET_API}`, { params: { 'asOfDate': asOfDate } });
  }
}
