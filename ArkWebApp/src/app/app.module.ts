import { BrowserModule } from '@angular/platform-browser';  
import {  NgModule } from '@angular/core';  
  
import { AppRoutingModule } from './app-routing.module';  
import { AppComponent } from './app.component';  
import { environment } from 'src/environments/environment';  
import { MsalModule, MsalInterceptor, MsalGuard, MsalService, MsalGuardConfiguration, MsalInterceptorConfiguration, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalRedirectComponent } from '@azure/msal-angular';  
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';  
import { MsalUserService } from './core/services/Auth/msaluser.service';  
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule} from '@angular/material/sidenav'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { HomeComponent } from '../app/home-component/home.component'
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { AccessControlComponent } from './shared/components/access-control/access-control.component';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { Platform } from '@angular/cdk/platform';
import { InputDateAdapter } from './shared/providers/date-adapter';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { IPublicClientApplication, PublicClientApplication, BrowserCacheLocation, InteractionType, LogLevel } from '@azure/msal-browser';
import { MsalHttpInterceptor } from './core/interceptors/msal-http.interceptor';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { NoRowsOverlayComponent } from './shared/components/no-rows-overlay/no-rows-overlay.component';
import { GeneralFilterModule } from './shared/modules/general-filter/general-filter.module';

export const protectedResourceMap: any =  
  [  
    // ["https://graph.microsoft.com/v1.0/me", ["user.read", "profile"]],
    [environment.baseUrl, environment.scopeUri  ],
    [environment.arkFunctionUrl, environment.arkFunctionScopeUri],
    [environment.feeCalcFunctionUrl, environment.feeCalcFunctionScopeUri]  
  ];  

export function loggerCallback(logLevel: LogLevel, message: string) {
  if(LogLevel.Error === logLevel || LogLevel.Warning === logLevel)
    console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {

  return new PublicClientApplication({
    auth: {
      clientId: environment.uiClienId,
      authority: 'https://login.microsoftonline.com/' + environment.tenantId,
      redirectUri: environment.redirectUrl
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Error,
        piiLoggingEnabled: false
      }
    }
  })
} 

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return { 
    interactionType: InteractionType.Redirect,
  };
}
  
  
@NgModule({  
  declarations: [  
    AppComponent, UnauthorizedComponent, HomeComponent, AccessControlComponent, NoRowsOverlayComponent
  ],  
  imports: [  
    MsalModule,
    BrowserModule,  
    AppRoutingModule,  
    HttpClientModule,

    AdaptableAngularAgGridModule, 
    AgGridModule,
    MatToolbarModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatCheckboxModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    GeneralFilterModule

  ],  
  providers: [  
    HttpClient,  
    MsalUserService, 
    MsalService,
    MsalBroadcastService,
    MsalGuard, 
    {  
      provide: HTTP_INTERCEPTORS, useClass: MsalHttpInterceptor, multi: true  
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    /* 
    Switched to: DD-MM-YYYY.
      Default locale is 'en-US' : MM-DD-YYYY
      
      Applicable to all Ng Material fields for this module.
    */
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},  
    {provide: DateAdapter, useClass: InputDateAdapter, deps: [MAT_DATE_LOCALE, Platform]}

  ],  
  bootstrap: [AppComponent, MsalRedirectComponent]  
})  
export class AppModule { } 