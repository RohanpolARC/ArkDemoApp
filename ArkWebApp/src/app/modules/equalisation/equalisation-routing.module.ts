import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedComponent } from 'src/app/shared/components/unauthorized/unauthorized.component';

const routes: Routes = [
  { path: '', component: UnauthorizedComponent }, 
  { path: 'portfolio-history', loadChildren: () => import('./portfolio-history/portfolio-history.module').then(m => m.PortfolioHistoryModule) }, 
  { path: 'position-cashflows', loadChildren: () => import('./position-cashflows/position-cashflows.module').then(m => m.PositionCashflowsModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EqualisationRoutingModule { }
