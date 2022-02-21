import { NgModule } from '@angular/core';  
import { Routes, RouterModule } from '@angular/router';  
import { MsalGuard } from '@azure/msal-angular'; 
import {PortfolioHistoryComponent} from '../app/modules/portfolio-history/portfolio-history.component' 
import { CashBalanceComponent } from './modules/cash-balance/cash-balance.component';
import { CapitalActivityComponent } from './modules/capital-activity/capital-activity.component';
import { RoleGuard } from './role.guard';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { HomeComponent } from './home-component/home.component';
//import { GridAccessComponent } from './modules/grid-access-test/grid-access/grid-access.component';
  
  
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [
      MsalGuard
    ]
  },  
  { path: 'portfolio-history',  
    component: PortfolioHistoryComponent,  
    canActivate: [
      MsalGuard,
      RoleGuard
    ],
    data: {
      tab: 'Going in Rates Editor'
    }  
  },
  { path: 'cash-balance', 
    component: CashBalanceComponent, 
    canActivate: [
      MsalGuard, 
      RoleGuard
    ],
    data: {
      tab: 'Cash Balance'
    }
  },
  { path: 'capital-activity', 
    component: CapitalActivityComponent, 
    canActivate: [
      MsalGuard, 
      RoleGuard
    ], 
    data: {
      tab: 'Capital Activity'
    }
  },
  { path: 'unauthorized', 
    component: UnauthorizedComponent,
    canActivate: [
      MsalGuard
    ]
  },
  // {
  //   path: 'grid-access',
  //   component: GridAccessComponent,
  //   canActivate: [
  //     MsalGuard
  //   ]
  // }
];  
  
@NgModule({  
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(){
  }
}