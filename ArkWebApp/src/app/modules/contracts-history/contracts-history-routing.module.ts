import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { ContractsHistoryComponent } from './contracts-history.component';

const routes: Routes = [
  { path: '', component: ContractsHistoryComponent, 
    canActivate: [MsalGuard ], 
    data: { tab: 'Contracts History'} 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractsHistoryRoutingModule { }
