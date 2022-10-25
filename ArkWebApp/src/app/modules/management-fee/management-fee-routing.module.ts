import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { ManagementFeeComponent } from './management-fee.component';

const routes: Routes = [{ path: '', component: ManagementFeeComponent, canActivate: [MsalGuard, RoleGuard], data: { tab: 'Management Fees' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementFeeRoutingModule { }
