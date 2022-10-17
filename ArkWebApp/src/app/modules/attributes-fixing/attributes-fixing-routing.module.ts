import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { AttributesFixingComponent } from './attributes-fixing.component';

const routes: Routes = 
[
    { 
        path: '', component: AttributesFixingComponent, 
        canActivate: [MsalGuard, RoleGuard], 
        data: { tab: 'Attributes Fixing' } 
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttributesFixingRoutingModule { }
