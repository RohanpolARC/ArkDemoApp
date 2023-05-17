import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from 'src/app/role.guard';
import { MarkChangesComponent } from './mark-changes.component';

const routes: Routes = [{ path: '', component: MarkChangesComponent, canActivate: [MsalGuard, RoleGuard], data: { tab: 'Mark Changes' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarkChangesRoutingModule { }
