import { NgModule } from '@angular/core';  
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';  
import { MsalGuard } from '@azure/msal-angular'; 
import { RoleGuard } from './role.guard';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { HomeComponent } from './home-component/home.component';
import { AccessControlComponent } from './shared/components/access-control/access-control.component';
    
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [
      MsalGuard
    ]
  },  
  { path: 'portfolio-history', loadChildren: () => import('./modules/portfolio-history/portfolio-history.module').then(m => m.PortfolioHistoryModule) },
  { path: 'cash-balance', loadChildren: () => import('./modules/cash-balance/cash-balance.module').then(m => m.CashBalanceModule) },
  { path: 'capital-activity', loadChildren: () => import('./modules/capital-activity/capital-activity.module').then(m => m.CapitalActivityModule) },
  { path: 'facility-detail', loadChildren: () => import('./modules/facility-detail/facility-detail.module').then(m => m.FacilityDetailModule) },
  { 
    path: 'liquidity-summary',
    loadChildren: () => import('./modules/liquidity-summary/liquidity-summary.module').then(m => m.LiquiditySummaryModule)
  },
  {
    path: 'access-control',
    component: AccessControlComponent,
    canActivate: [
      MsalGuard,
      RoleGuard
    ],
    data: {
      tab: 'Access Control'
    }
  },
  { path: 'accessibility', 
    component: UnauthorizedComponent,
    canActivate: [
      MsalGuard
    ]
  },
  {
    path: 'irr',
    loadChildren: () => 
    import('./modules/irr-calculation/irr-calculation.module').then(m => m.IrrCalculationModule)
  },
  {
    path: 'portfolio-mapping',
    loadChildren: () =>
    import('./modules/portfolio-manager/portfolio-manager.module').then(m => m.PortfolioManagerModule)
  },
  { path: 'unfunded-assets', 
    loadChildren: () => 
    import('./modules/unfunded-assets/unfunded-assets.module').then(m => m.UnfundedAssetsModule) 
  },
  { path: 'contract-history', 
    loadChildren: () => import('./modules/contract-history/contract-history.module').then(m => m.ContractHistoryModule) 
  },
  { path: 'fee-calculation', 
    loadChildren: () => import('./modules/fee-calculation/fee-calculation.module').then(m => m.FeeCalculationModule) },
  { path: 'fee-presets',
    loadChildren: () => import('./modules/fee-presets/fee-presets.module').then(m => m.FeePresetsModule) },
  { path: 'attributes-fixing',
    loadChildren: () => import('./modules/attributes-fixing/attributes-fixing.module').then(m => m.AttributesFixingModule) }
];

@NgModule({  
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(){
  }
}