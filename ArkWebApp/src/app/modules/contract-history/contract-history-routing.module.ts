import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { ContractHistoryComponent } from './contract-history.component';

const routes: Routes = [
  { path: '', component: ContractHistoryComponent, 
    canActivate: [MsalGuard, RoleGuard], 
    data: { tab: 'Contract History'} 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractHistoryRoutingModule { }
