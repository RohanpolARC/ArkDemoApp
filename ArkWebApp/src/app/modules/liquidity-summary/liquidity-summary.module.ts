import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquiditySummaryComponent } from './liquidity-summary.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    LiquiditySummaryComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    AdaptableAngularAgGridModule,
    AgGridModule.withComponents([]),
    MatCardModule
  ]
})
export class LiquiditySummaryModule { }
