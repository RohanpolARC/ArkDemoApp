import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioHistoryComponent } from './portfolio-history.component';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';



const routes: Routes = [
  {
    path: '', component: PortfolioHistoryComponent,
    canActivate: [
      MsalGuard,
      RoleGuard
    ],
    data: {
      tab: 'Equalisation - Portfolio History'
    } 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortfolioHistoryRoutingModule { }
