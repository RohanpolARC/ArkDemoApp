import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfolioHistoryRoutingModule } from './portfolio-history-routing.module';
import { PortfolioHistoryComponent } from './portfolio-history.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { MatCardModule } from '@angular/material/card';
import { GridComponent } from './grid/grid.component';
import { AgGridModule } from '@ag-grid-community/angular';


@NgModule({
  declarations: [
    PortfolioHistoryComponent,
    GridComponent
  ],
  imports: [
    CommonModule,
    PortfolioHistoryRoutingModule,
    AdaptableAngularAgGridModule,
    AgGridModule,
    MatCardModule
  ],
  providers: []
})
export class PortfolioHistoryModule { }
