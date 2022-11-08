import { BrowserModule } from '@angular/platform-browser';  
import { NgModule } from '@angular/core';  
  
import { AppRoutingModule } from './app-routing.module';  
import { AppComponent } from './app.component';  
import { environment } from 'src/environments/environment';  
import { MsalModule, MsalInterceptor, MsalGuard, MsalService, MsalGuardConfiguration, MsalInterceptorConfiguration, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService } from '@azure/msal-angular';  
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { HomeComponent } from '../app/home-component/home.component'
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DetailedViewComponent } from './shared/components/detailed-view/detailed-view.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AccessControlComponent } from './shared/components/access-control/access-control.component';
import { MatSelectModule } from '@angular/material/select';
import { Platform } from '@angular/cdk/platform';
import { InputDateAdapter } from './shared/providers/date-adapter';
import { FilterPaneModule } from './modules/other-modules/filter-pane/filter-pane.module';
import { MatTableModule } from '@angular/material/table';
import { IPublicClientApplication, PublicClientApplication, BrowserCacheLocation, InteractionType, LogLevel } from '@azure/msal-browser';
import { MsalHttpInterceptor } from './core/interceptors/msal-http.interceptor';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    AppComponent, UnauthorizedComponent, HomeComponent, DetailedViewComponent, AccessControlComponent
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
    FilterPaneModule,

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
  bootstrap: [AppComponent]  
})  
export class AppModule { } 