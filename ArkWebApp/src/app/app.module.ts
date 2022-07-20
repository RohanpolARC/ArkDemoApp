import { BrowserModule } from '@angular/platform-browser';  
import { NgModule } from '@angular/core';  
  
import { AppRoutingModule } from './app-routing.module';  
import { AppComponent } from './app.component';  
import { environment } from 'src/environments/environment';  
import { MsalModule, MsalInterceptor } from '@azure/msal-angular';  
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';  
import { MsalUserService } from './core/services/Auth/msaluser.service';  
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule} from '@angular/material/sidenav'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {MatDialogModule} from '@angular/material/dialog';
import {FormsModule,ReactiveFormsModule} from '@angular/forms'
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {PortfolioHistoryModule} from './modules/portfolio-history/portfolio-history.module'
import {MatMenuModule} from '@angular/material/menu';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { CashBalanceModule } from './modules/cash-balance/cash-balance.module';

import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CapitalActivityModule } from './modules/capital-activity/capital-activity.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import {HomeComponent} from '../app/home-component/home.component'
import { FacilityDetailModule } from './modules/facility-detail/facility-detail.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LiquiditySummaryModule } from './modules/liquidity-summary/liquidity-summary.module';
import { DetailedViewComponent } from './shared/components/detailed-view/detailed-view.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AccessControlComponent } from './shared/components/access-control/access-control.component';
import { MatSelectModule } from '@angular/material/select';
import { IrrCalculationModule } from './modules/irr-calculation/irr-calculation.module';
import { PortfolioManagerModule } from './modules/portfolio-manager/portfolio-manager.module';
import { CheckboxEditorComponent } from './shared/components/checkbox-editor/checkbox-editor.component';

export const protectedResourceMap: any =  
  [  
    [environment.baseUrl, environment.scopeUri  
    ]  
  ];  
  
@NgModule({  
  declarations: [  
    AppComponent, UnauthorizedComponent, HomeComponent, DetailedViewComponent, AccessControlComponent, CheckboxEditorComponent
  ],  
  imports: [  
    MsalModule.forRoot({  
      clientID: environment.uiClienId,  
      authority: 'https://login.microsoftonline.com/' + environment.tenantId,  
      //cacheLocation: 'localStorage',  
      protectedResourceMap: protectedResourceMap,  
      redirectUri: environment.redirectUrl  
    }),  
    BrowserModule,  
    AppRoutingModule,  
    HttpClientModule,
    AdaptableAngularAgGridModule, 
  AgGridModule.withComponents([]),
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
  PortfolioHistoryModule,
  MatMenuModule,
  MatSnackBarModule,
  CashBalanceModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatInputModule,
  CapitalActivityModule,
  MatTooltipModule,
  FacilityDetailModule,
  NgMultiSelectDropDownModule.forRoot(),
  LiquiditySummaryModule,
  MatCheckboxModule,
  MatSelectModule,
  IrrCalculationModule,
  PortfolioManagerModule
  ],  
  providers: [  
    HttpClient,  
    MsalUserService,  
    {  
      provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true  
    },
    /* 
    Switched to: DD-MM-YYYY.
      Default locale is 'en-US' : MM-DD-YYYY
      
      Applicable to all Ng Material fields for this module.
    */
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},  
    
  ],  
  bootstrap: [AppComponent]  
})  
export class AppModule { } 