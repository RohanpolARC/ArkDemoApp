import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketValueDeltaComponent } from './market-value-delta.component';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';

const routes: Routes = [
  { path: '', 
    component: MarketValueDeltaComponent,
    canActivate: [
      MsalGuard, RoleGuard
    ],  
    data: { tab: 'Market Value Delta' }

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketValueDeltaRoutingModule { }
