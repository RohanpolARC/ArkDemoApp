import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeeAttributionComponent } from './fee-attribution.component';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from '../../role.guard';

const routes: Routes = [
  { path: '', component: FeeAttributionComponent, canActivate: [ MsalGuard, RoleGuard ], 
    data: {
      tab: 'Fee Attribution'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeAttributionRoutingModule { }