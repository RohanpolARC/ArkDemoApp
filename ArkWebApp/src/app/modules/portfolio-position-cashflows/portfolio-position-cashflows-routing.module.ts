import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { PortfolioPositionCashflowsComponent } from './portfolio-position-cashflows.component';

const routes: Routes = [
  { path: '', 
    component: PortfolioPositionCashflowsComponent,
    canActivate: [
      MsalGuard, RoleGuard
    ],  
    data: { tab: 'Position Cashflow' }

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortfolioPositionCashflowsRoutingModule { }
