import { BrowserModule } from '@angular/platform-browser';  
import { NgModule } from '@angular/core';  
  
import { AppRoutingModule } from './app-routing.module';  
import { AppComponent } from './app.component';  
import { environment } from 'src/environments/environment';  
import { MsalModule, MsalInterceptor } from '@azure/msal-angular';  
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';  
import { MsalUserService } from './msaluser.service';  
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule} from '@angular/material/sidenav'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {MatDialogModule} from '@angular/material/dialog';
import { AddAssetGirComponent } from './add-asset-gir/add-asset-gir.component'
import {FormsModule,ReactiveFormsModule} from '@angular/forms'
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import { BtnCellRenderer } from './btn-cell-renderer.component';

export const protectedResourceMap: any =  
  [  
    [environment.baseUrl, environment.scopeUri  
    ]  
  ];  
  
@NgModule({  
  declarations: [  
    AppComponent, AddAssetGirComponent , BtnCellRenderer 
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
  AgGridModule.withComponents([BtnCellRenderer]),
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
  MatFormFieldModule
  ],  
  providers: [  
    HttpClient,  
    MsalUserService,  
    {  
      provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true  
    }  
  ],  
  bootstrap: [AppComponent]  
})  
export class AppModule { } 