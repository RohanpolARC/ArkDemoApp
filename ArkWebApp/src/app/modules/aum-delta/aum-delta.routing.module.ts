import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { AumDeltaComponent } from './aum-delta.component';

const routes: Routes = [
  {
    path: '', component: AumDeltaComponent, 
    canActivate: [
        MsalGuard, RoleGuard
    ], 
    data: { tab: 'AUM Delta' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AUMDeltaRoutingModule { }
