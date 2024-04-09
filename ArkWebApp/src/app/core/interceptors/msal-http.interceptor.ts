import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpContextToken
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { environment } from 'src/environments/environment';
import { switchMap } from 'rxjs/operators';
import { BrowserAuthError } from '@azure/msal-browser';
import { DataService } from '../services/data.service';

type RESOURCE_TYPE = 'ArkWebApi' | 'IRRCalculatorFunction';

export const RESOURCE_CONTEXT = new HttpContextToken(() => 'ArkWebApi')

@Injectable()
export class MsalHttpInterceptor implements HttpInterceptor {

  constructor(private msalSvc: MsalService,
    private dataSvc: DataService) {}

  async checkActiveAccount() {
    const instance = this.msalSvc.instance;
    const accounts = this.msalSvc.instance.getAllAccounts()

    //https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/c7e042d457f6a1f464bb342c27a04b28f928880f/lib/msal-browser/docs/errors.md?plain=1#L366
    // In msal v2->v3 upgrade, You must call and await the initialize function before attempting to call any other MSAL API.
    await instance.initialize();
    if(accounts.length === 0){
      await instance.loginRedirect();

      await instance.handleRedirectPromise().then(
        res => {
          if(res && res.account)
            instance.setActiveAccount(res.account);
          else if (res == null){
            instance.loginRedirect();
          }
        }
      );
    }
    else instance.setActiveAccount(accounts[0]);

  }
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    this.checkActiveAccount.bind(this)();

    let applicableScopes: string[] = environment.scopeUri
  
    switch(request.context.get(RESOURCE_CONTEXT)) {
      case 'IRRCalculatorFunction':
        applicableScopes = environment.arkFunctionScopeUri
        break;
      case 'FeeCalculatorFunction':
        applicableScopes = environment.feeCalcFunctionScopeUri
        break;
      default: 
        break;
    }

    try {
      const tokenResponse = this.msalSvc.acquireTokenSilent({
        scopes: applicableScopes,
        authority: 'https://login.microsoftonline.com/' + environment.tenantId,
        account: this.msalSvc.instance.getActiveAccount(),
        forceRefresh: false
      }).pipe(switchMap(resp => {
          request = request.clone({
            setHeaders: { Authorization: `Bearer ${resp.accessToken}` }
          })
          return next.handle(request)
      }));

      return tokenResponse;
    }
    catch(error){
      console.error(`Interceptor acquire token error: ${error}`)

      if(error instanceof BrowserAuthError)
        this.dataSvc.setWarningMsg('Please sign out and sign in again', 'Dismiss')
    }
    return next.handle(request)
  }
}