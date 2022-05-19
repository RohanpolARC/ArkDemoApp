
import { NgModule } from '@angular/core';  
import { Routes, RouterModule } from '@angular/router';  
import { MsalGuard } from '@azure/msal-angular'; 
import { PortfolioHistoryComponent } from '../app/modules/portfolio-history/portfolio-history.component' 
import { CashBalanceComponent } from './modules/cash-balance/cash-balance.component';
import { CapitalActivityComponent } from './modules/capital-activity/capital-activity.component';
import { RoleGuard } from './role.guard';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { HomeComponent } from './home-component/home.component';
import { FacilityDetailComponent } from './modules/facility-detail/facility-detail.component';
import { LiquiditySummaryComponent } from './modules/liquidity-summary/liquidity-summary.component';
import { AccessControlComponent } from './shared/components/access-control/access-control.component';
import { IrrCalculationComponent } from './modules/irr-calculation/irr-calculation.component';
import { IrrResultComponent } from './modules/irr-calculation/irr-result/irr-result.component';
  
  
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
  {
    path: 'facility-detail',
    component: FacilityDetailComponent,
    canActivate: [
      MsalGuard,
      RoleGuard
    ],
    data: {
      tab: 'Asset Browser'
    }
  },
  {
    path: 'liquidity-summary',
    component: LiquiditySummaryComponent,
    canActivate: [
      MsalGuard,
      RoleGuard
    ],
    data: {
      tab: 'Liquidity Summary'
    }
  },
  {
    path: 'access-control',
    component: AccessControlComponent,
    canActivate: [
      MsalGuard,
      RoleGuard
    ],
    data: {
      tab: 'Access Control'
    }
  },
  { path: 'accessibility', 
    component: UnauthorizedComponent,
    canActivate: [
      MsalGuard
    ]
  },
  {
    path: 'irr',
    children: [
      { path: 'portfoliomodeller', component: IrrCalculationComponent}
    ],
    canActivate: [
      MsalGuard,
      // RoleGuard
    ]
  }
];  
  
@NgModule({  
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(){
  }
}