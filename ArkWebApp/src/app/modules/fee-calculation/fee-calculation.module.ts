import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeeCalculationRoutingModule } from './fee-calculation-routing.module';
import { FeeCalculationComponent } from './fee-calculation.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { FeeCalculationSummaryComponent } from './fee-calculation-summary/fee-calculation-summary.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FeeCashflowsComponent } from './fee-cashflows/fee-cashflows.component';
import { PortfolioModellerService } from '../irr-calculation/service/portfolio-modeller.service';
import { RefService } from '../irr-calculation/portfolio-modeller/ref/ref.service';
import { ComponentReaderService } from '../irr-calculation/service/component-reader.service';


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
  ],
  providers: [
    PortfolioModellerService,
    RefService,
    ComponentReaderService
  ]
})
export class FeeCalculationModule { }
