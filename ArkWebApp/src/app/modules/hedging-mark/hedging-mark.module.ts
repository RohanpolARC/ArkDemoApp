import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatIconModule } from '@angular/material/icon';
import { HedgingMarkComponent } from './hedging-mark.component';
import { HedgingMarkRoutingModule } from './hedging-mark-routing.module';
import { HedgingMarkService } from './service/hedging-mark.service';



@NgModule({
  declarations: [
    HedgingMarkComponent
  ],
  imports: [
    CommonModule,
    HedgingMarkRoutingModule,

    AdaptableAngularAgGridModule,
    AgGridModule,
    MatIconModule,

    MatCardModule
  ],
  providers:[
    HedgingMarkService        // Limiting Hedging Mark service for this module only
  ]
})
export class HedgingMarkModule { }
