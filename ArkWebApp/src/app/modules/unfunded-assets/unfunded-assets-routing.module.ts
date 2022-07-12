import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnfundedAssetsComponent } from './unfunded-assets.component';

const routes: Routes = [{ path: '', component: UnfundedAssetsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnfundedAssetsRoutingModule { }
