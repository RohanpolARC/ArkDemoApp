import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { FeePresetsComponent } from './fee-presets.component';

const routes: Routes = 
[
    { 
        path: '', component: FeePresetsComponent, 
        canActivate: [MsalGuard, RoleGuard], 
        data: { tab: 'Fee Presets' } 
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeePresetsRoutingModule { }
