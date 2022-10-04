import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { APIConfig } from 'src/app/configs/api-config';
import { MsalUserService } from '../Auth/msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class ContractHistoryService {

  constructor(
    private http: HttpClient,
    private msalSvc: MsalUserService
  ) { }

  private getHttpOptions(){
    return {
      headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalSvc.GetAccessToken()  
      })
    }
  }

  private fundsMessage = new BehaviorSubject<any>(null)
  currentfundValues = this.fundsMessage.asObservable();
  changeFundValues(values: string[]){
      this.fundsMessage.next(values);
  }

  private isLatestMessage = new BehaviorSubject<any>(null)
  currentisLatestValue = this.isLatestMessage.asObservable();
  changeisLatestValue(checked: boolean){
    this.isLatestMessage.next(checked);
  }

  public getContractHistory(model: {
    funds: string, isLatest: boolean
  }){
    return this.http.post<any[]>(`${APIConfig.CONTRACT_HISTORY_GET_API}`, model, this.getHttpOptions());
  }

}
