import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from './grid/grid.component';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from '@ag-grid-community/angular';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { PortfolioPositionCashflowsRoutingModule } from './portfolio-position-cashflows-routing.module';
import { PortfolioPositionCashflowsComponent } from './portfolio-position-cashflows.component';

@NgModule({
  declarations: [
    PortfolioPositionCashflowsComponent,
    GridComponent
  ],
  imports: [
    CommonModule,

    PortfolioPositionCashflowsRoutingModule,

    AgGridModule,
    AdaptableAngularAgGridModule,

    MatCardModule

  ]
})
export class PortfolioPositionCashflowsModule { }