import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { PutAccessModel } from 'src/app/shared/models/GeneralModel';
import { MsalUserService } from './msaluser.service';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  accessibleTabs: {tab: string, isWrite: boolean}[] = null;
  
  private httpOptions = {  
    headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalService.GetAccessToken()  
    })
  };

  constructor(private http: HttpClient, 
              private msalService: MsalUserService) {
  }

  public getTabs(){
    let userRole: string[] = this.msalService.getCurrentUserInfo().idToken['roles'];

    return this.http.get<any[]>(`${APIConfig.ARKWEB_ACCESSIBLE_TABS_GET_API}/?userRole=${userRole}`, this.httpOptions);
  }

  public getRolesTabs(){
    return this.http.get<any[]>(`${APIConfig.ARKWEB_TABROLE_ASSOCIATION_GET_API}`, this.httpOptions);
  }

  public putAssociations(model: PutAccessModel){
    return this.http.post<any>(`${APIConfig.ARKWEB_PUTASSOCIATIONS_API}`, model, this.httpOptions);
  }
}