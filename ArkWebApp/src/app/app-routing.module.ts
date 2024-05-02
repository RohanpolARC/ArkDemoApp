import { NgModule } from '@angular/core';  
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { HomeComponent } from './home-component/home.component';
    
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: []
  },  
   { path: 'market-value-delta', loadChildren: () => import('./modules/market-value-delta/market-value-delta.module').then(m => m.MarketValueDeltaModule) },
   { path: 'facility-detail', loadChildren: () => import('./modules/facility-detail/facility-detail.module').then(m => m.FacilityDetailModule) },
   { path: 'aum-report', loadChildren: () => import('./modules/aum-report/aum-report.module').then(m => m.AumReportModule) },
];

@NgModule({  
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(){ }
}