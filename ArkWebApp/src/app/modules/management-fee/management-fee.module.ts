import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagementFeeRoutingModule } from './management-fee-routing.module';
import { ManagementFeeComponent } from './management-fee.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    ManagementFeeComponent
  ],
  imports: [
    CommonModule,
    ManagementFeeRoutingModule,

    AgGridModule,
    AdaptableAngularAgGridModule,
    MatCardModule
  ]
})
export class ManagementFeeModule { }
