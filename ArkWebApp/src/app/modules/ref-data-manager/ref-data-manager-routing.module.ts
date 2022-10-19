import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { RefDataManagerComponent } from './ref-data-manager.component';

const routes: Routes = [
  {
    path: '', component: RefDataManagerComponent, 
    // canActivate: [MsalGuard, RoleGuard], 
    // data: { tab: 'Ref Data Manager' } 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RefDataManagerRoutingModule { }
