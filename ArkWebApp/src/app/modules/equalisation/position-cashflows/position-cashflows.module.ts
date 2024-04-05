import { NgModule } from '@angular/core';
import {CommonModule } from '@angular/common';
import {AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import { PositionCashflowsRoutingModule } from './position-cashflows-routing.module';
import { PositionCashflowsComponent } from './position-cashflows.component';
import { MatCardModule } from '@angular/material/card';
import { GridComponent } from './grid/grid.component';


@NgModule({
  declarations: [
    PositionCashflowsComponent,
    GridComponent
  ],
  exports: [PositionCashflowsComponent],
  imports: [
    CommonModule,
    PositionCashflowsRoutingModule,   
    AdaptableAngularAgGridModule,
    AgGridModule,
    MatCardModule
  ]
})
export class PositionCashflowsModule { }
