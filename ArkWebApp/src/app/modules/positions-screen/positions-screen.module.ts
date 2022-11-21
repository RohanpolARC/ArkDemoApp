import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositionsScreenComponent } from './positions-screen.component';
import { PositionScreenRoutingModule } from './positions-screen-routing.module';
import { MatCardModule } from '@angular/material/card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';



@NgModule({
  declarations: [
    PositionsScreenComponent
  ],
  imports: [
    CommonModule,
    PositionScreenRoutingModule,

    AdaptableAngularAgGridModule,
    AgGridModule,

    MatCardModule
  ]
})
export class PositionsScreenModule { }
