import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeeCalculationRoutingModule } from './fee-calculation-routing.module';
import { FeeCalculationComponent } from './fee-calculation.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { FeeCalculationSummaryComponent } from './fee-calculation-summary/fee-calculation-summary.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FeeCashflowsComponent } from './fee-cashflows/fee-cashflows.component';


@NgModule({
  declarations: [
    FeeCalculationComponent,
    FeeCalculationSummaryComponent,
    FeeCashflowsComponent
  ],
  imports: [
    CommonModule,
    FeeCalculationRoutingModule,
    AgGridModule,
    AdaptableAngularAgGridModule,
    MatCardModule,
    MatExpansionModule
  ],
  exports: [
    FeeCalculationSummaryComponent,
    FeeCashflowsComponent
  ]
})
export class FeeCalculationModule { }
