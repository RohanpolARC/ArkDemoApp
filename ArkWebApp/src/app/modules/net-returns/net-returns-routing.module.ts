import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NetReturnsComponent } from './net-returns.component';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';

const routes: Routes = [
  { path: '', 
    component: NetReturnsComponent,
    canActivate: [
      MsalGuard, RoleGuard
    ],  
    data: { tab: 'Net Returns' }

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NetReturnsRoutingModule { }
