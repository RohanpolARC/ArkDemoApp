import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefDataManagerComponent } from './ref-data-manager.component';

const routes: Routes = [
  {
    path: '', component: RefDataManagerComponent, 
    canActivate: [], 
    data: { tab: 'Ref Data Manager' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RefDataManagerRoutingModule { }
