import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { AumReportComponent } from './aum-report.component';

const routes: Routes = [
  {
    path: '', component: AumReportComponent, 
    canActivate: [
        MsalGuard, RoleGuard
    ], 
    data: { tab: 'AUM Report' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AUMReportRoutingModule { }
