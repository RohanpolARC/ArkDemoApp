import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractsHistoryRoutingModule } from './contracts-history-routing.module';
import { ContractsHistoryComponent } from './contracts-history.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';


@NgModule({
  declarations: [
    ContractsHistoryComponent
  ],
  imports: [
    CommonModule,
    ContractsHistoryRoutingModule,

    AgGridModule,
    AdaptableAngularAgGridModule,
    MatCardModule
  ],
  providers: [
  ]
})
export class ContractsHistoryModule { }
