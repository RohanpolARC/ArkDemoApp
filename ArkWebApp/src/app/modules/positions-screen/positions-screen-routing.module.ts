import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { PositionsScreenComponent } from './positions-screen.component';

const routes: Routes = [
  {
    path: '', component: PositionsScreenComponent, 
    canActivate: [
        MsalGuard, RoleGuard
    ], 
    data: { tab: 'Ref Data Manager' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionScreenRoutingModule { }
