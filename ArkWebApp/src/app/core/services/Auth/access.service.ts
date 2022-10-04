import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
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
  
  constructor(private http: HttpClient, 
              private msalService: MsalService) {
  }

  public getTabs(){

    let userRole: string[] = this.msalService.instance.getActiveAccount()?.idTokenClaims?.roles
    return this.http.get<any[]>(`${APIConfig.ARKWEB_ACCESSIBLE_TABS_GET_API}/?userRole=${userRole}`);
  }

  public getRolesTabs(){
    return this.http.get<any[]>(`${APIConfig.ARKWEB_TABROLE_ASSOCIATION_GET_API}`);
  }

  public putAssociations(model: PutAccessModel){
    return this.http.post<any>(`${APIConfig.ARKWEB_PUTASSOCIATIONS_API}`, model);
  }
}
