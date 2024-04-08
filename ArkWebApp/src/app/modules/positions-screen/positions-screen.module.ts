import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositionsScreenComponent } from './positions-screen.component';
import { PositionScreenRoutingModule } from './positions-screen-routing.module';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    PositionsScreenComponent
  ],
  imports: [
    CommonModule,
    PositionScreenRoutingModule,

    AdaptableAngularAgGridModule,
    AgGridModule,
    MatIconModule,

    MatCardModule
  ]
})
export class PositionsScreenModule { }
