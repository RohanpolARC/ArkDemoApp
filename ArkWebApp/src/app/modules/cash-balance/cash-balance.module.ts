import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashBalanceComponent } from './cash-balance.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';

import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CashBalanceRoutingModule } from './cash-balance-routing.module';

@NgModule({
  declarations: [
    CashBalanceComponent
  ],
  exports: [CashBalanceComponent],
  imports: [
    CommonModule,
    CashBalanceRoutingModule,
    
    AdaptableAngularAgGridModule,
    AgGridModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatTooltipModule,
    MatIconModule
  ]
})
export class CashBalanceModule { }
