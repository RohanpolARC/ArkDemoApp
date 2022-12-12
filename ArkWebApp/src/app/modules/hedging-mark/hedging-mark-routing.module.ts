import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { HedgingMarkComponent } from './hedging-mark.component';

const routes: Routes = [
  {
    path: '', component: HedgingMarkComponent, 
    canActivate: [
        MsalGuard, RoleGuard
    ], 
    data: { tab: 'Hedging Mark' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HedgingMarkRoutingModule { }
