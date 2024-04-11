import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashBalanceComponent } from './cash-balance.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
