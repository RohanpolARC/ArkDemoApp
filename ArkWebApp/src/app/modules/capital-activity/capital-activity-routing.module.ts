import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { CapitalActivityComponent } from './capital-activity.component';

const routes: Routes = [
  {
    path: '', component: CapitalActivityComponent,
    canActivate: [
      MsalGuard,
      RoleGuard
    ],
    data: {
      tab: 'Capital Activity'
    } 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CapitalActivityRoutingModule { }
