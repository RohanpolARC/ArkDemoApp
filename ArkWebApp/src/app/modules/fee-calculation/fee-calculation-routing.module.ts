import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { FeeCalculationComponent } from './fee-calculation.component';

const routes: Routes = [{ path: '', component: FeeCalculationComponent, canActivate: [MsalGuard], data: { tab: 'Fee Calculation' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeCalculationRoutingModule { }
