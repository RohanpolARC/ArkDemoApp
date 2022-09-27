import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { CashBalanceComponent } from './cash-balance.component';

const routes: Routes = [
  {
    path: '', component: CashBalanceComponent,
    canActivate: [
      MsalGuard,
      RoleGuard
    ],
    data: {
      tab: 'Cash Balance'
    } 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashBalanceRoutingModule { }