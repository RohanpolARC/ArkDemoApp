import { NgModule } from '@angular/core';  
import { Routes, RouterModule } from '@angular/router';  
import { AppComponent } from './app.component';  
import { MsalGuard } from '@azure/msal-angular'; 
import {PortfolioHistoryComponent} from '../app/modules/portfolio-history/portfolio-history.component' 
import { CashBalanceComponent } from './modules/cash-balance/cash-balance.component';
import { CapitalActivityComponent } from './modules/capital-activity/capital-activity.component';
  
  
const routes: Routes = [  
  
  { path: '',  component: PortfolioHistoryComponent,  canActivate: [MsalGuard]  },
  { path: 'cash-balance', component: CashBalanceComponent, canActivate: [MsalGuard]},
  { path: 'capital-activity', component: CapitalActivityComponent, canActivate:[MsalGuard]},
];  
  
@NgModule({  
  imports: [RouterModule.forRoot(routes)],  
  exports: [RouterModule]  
})  
export class AppRoutingModule { } 