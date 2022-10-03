import { Injectable } from '@angular/core';  
// import * as Msal from 'msal';  
import { environment } from 'src/environments/environment';  
import { Observable } from 'rxjs';  
import { MsalService } from '@azure/msal-angular';
  
@Injectable()  
export class MsalUserService {  
    public accessToken: any;  
    // public clientApplication: Msal.UserAgentApplication = null;  
    constructor(
        public msalSvc: MsalService
    ) {  
        this.getAuthDetails();  
    }  
  
    public getAuthDetails() {
        // this.clientApplication = new Msal.UserAgentApplication(
        //     environment.uiClienId,
        //     'https://login.microsoftonline.com/' + environment.tenantId,
        //     this.authCallback,
        //     {
        //         storeAuthStateInCookie: true,
        //     });

    }

    public GetAccessToken(): Observable<any> {  
        // if (sessionStorage.getItem('msal.idtoken') !== undefined && sessionStorage.getItem('msal.idtoken') != null) {  
        //     this.accessToken = sessionStorage.getItem('msal.idtoken');  
        // }  
        return this.accessToken;  
    }  
  
    public authCallback(errorDesc, token, error, tokenType) {  
        if (token) {  
  
        } else {  
            console.log(error + ':' + errorDesc);  
        }  
    }  
  
    public getCurrentUserInfo()  {  
        return this.msalSvc.instance.getActiveAccount();
    }

    public  getUserName():string {  
        return this.msalSvc.instance.getActiveAccount()?.name;
    }

    public logout() {  
        this.msalSvc.logout();
      }  
}  