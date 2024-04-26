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