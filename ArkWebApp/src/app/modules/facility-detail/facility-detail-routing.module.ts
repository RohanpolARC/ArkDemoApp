import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { FacilityDetailComponent } from './facility-detail.component';

const routes: Routes = [
  {
    path: '', component: FacilityDetailComponent,
    canActivate: [ ],
    data: {
      tab: 'Asset Browser'
    } 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacilityDetailRoutingModule { }
