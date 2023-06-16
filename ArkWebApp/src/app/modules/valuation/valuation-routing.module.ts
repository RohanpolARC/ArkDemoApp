import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { ValuationComponent } from './valuation.component';

const routes: Routes = [{ path: '', component: ValuationComponent, canActivate:[ MsalGuard, RoleGuard ], data: {
  tab: 'Valuation'
} }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValuationRoutingModule { }
