import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatIconModule } from '@angular/material/icon';
import { HedgingMarkComponent } from './hedging-mark.component';
import { HedgingMarkRoutingModule } from './hedging-mark-routing.module';
import { HedgingMarkService } from './service/hedging-mark.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';



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

    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,

    DetailedViewModule
  ],
  providers:[
    HedgingMarkService        // Limiting Hedging Mark service for this module only
  ]
})
export class HedgingMarkModule { }
