import { NgModule } from '@angular/core';  
import { Routes, RouterModule } from '@angular/router';  
import { AppComponent } from './app.component';  
import { MsalGuard } from '@azure/msal-angular'; 
import {PortfolioHistoryComponent} from '../app/modules/portfolio-history/portfolio-history.component' 
  
  
const routes: Routes = [  
  
  { path: '',  component: PortfolioHistoryComponent,  canActivate: [MsalGuard]  }
];  
  
@NgModule({  
  imports: [RouterModule.forRoot(routes)],  
  exports: [RouterModule]  
})  
export class AppRoutingModule { } 