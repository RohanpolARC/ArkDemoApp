import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeeAttributionRoutingModule } from './fee-attribution-routing.module';
import { FeeAttributionComponent } from './fee-attribution.component';
import { FeeAttributionService } from './services/fee-attribution.service';
import { FeeAttributionGridComponent } from './fee-attribution-grid/fee-attribution-grid.component';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from '@ag-grid-community/angular';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';

@NgModule({
  declarations: [
    FeeAttributionComponent,
    FeeAttributionGridComponent
  ],
  imports: [
    CommonModule,
    FeeAttributionRoutingModule,
    MatCardModule,
    AgGridModule,
    AdaptableAngularAgGridModule
  ],
  providers: [
    FeeAttributionService 
   ]

  })
export class FeeAttributionModule { }
