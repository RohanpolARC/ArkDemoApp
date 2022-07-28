import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { IrrCalculationComponent } from './irr-calculation.component';

const routes: Routes = [
  {
    path: '',
    children: [
        { path: 'portfoliomodeller', component: IrrCalculationComponent}
    ],
    canActivate: [
        MsalGuard,
        RoleGuard
    ],
    data: {
        tab: 'Portfolio Modeller'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IrrCalculationRoutingModule { }
