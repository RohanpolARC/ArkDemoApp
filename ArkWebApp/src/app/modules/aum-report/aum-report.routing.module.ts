import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AumReportComponent } from './aum-report.component';

const routes: Routes = [
  {
    path: '', component: AumReportComponent, 
    canActivate: [], 
    data: { tab: 'AUM Report' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AUMReportRoutingModule { }
