import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractHistoryRoutingModule } from './contract-history-routing.module';
import { ContractHistoryComponent } from './contract-history.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';


@NgModule({
  declarations: [
    ContractHistoryComponent
  ],
  imports: [
    CommonModule,
    ContractHistoryRoutingModule,

    AgGridModule,
    AdaptableAngularAgGridModule,
    MatCardModule
  ],
  providers: [
  ]
})
export class ContractHistoryModule { }
