import { NgModule } from '@angular/core';
import { MarketValueDeltaComponent } from './market-value-delta.component';
import { MarketValueDeltaRoutingModule } from './market-value-delta-routing.module';
import { CommonModule } from '@angular/common';
import { GridComponent } from './grid/grid.component';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from '@ag-grid-community/angular';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { MarketValueDeltaService } from 'src/app/core/services/MarketValueDelta/market-value-delta.service';
import { PortfolioManageModelComponent } from './portfolio-manage-model/portfolio-manage-model.component';
import { PortfolioManageModelGridComponent } from './portfolio-manage-model-grid/portfolio-manage-model-grid.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    MarketValueDeltaComponent,
    GridComponent,
    PortfolioManageModelComponent,
    PortfolioManageModelGridComponent
  ],
  imports: [
    CommonModule,

    MarketValueDeltaRoutingModule,

    AgGridModule,
    AdaptableAngularAgGridModule,

    MatCardModule,
    MatDialogModule

  ],
  providers: [
    MarketValueDeltaService
  ]
})
export class MarketValueDeltaModule { }
