import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractHistoryFilterComponent } from './contract-history-filter/contract-history-filter.component';
import { MultiSelectModule } from 'src/app/shared/components/multi-select/multi-select.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CashBalanceFilterComponent } from './cash-balance-filter/cash-balance-filter.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FacilityDetailFilterComponent } from './facility-detail-filter/facility-detail-filter.component';
import { MatInputModule } from '@angular/material/input';
import { LiquiditySummaryFilterComponent } from './liquidity-summary-filter/liquidity-summary-filter.component';
import { IrrCalculationFilterComponent } from './irr-calculation-filter/irr-calculation-filter.component';

@NgModule({
  declarations: [
    ContractHistoryFilterComponent,
    CashBalanceFilterComponent,
    FacilityDetailFilterComponent,
    LiquiditySummaryFilterComponent,
    IrrCalculationFilterComponent
  ],
  imports: [
    CommonModule,
    MultiSelectModule,
    MatSlideToggleModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  exports: [
    ContractHistoryFilterComponent,
    CashBalanceFilterComponent,
    FacilityDetailFilterComponent,
    LiquiditySummaryFilterComponent,
    IrrCalculationFilterComponent
  ]
})
export class FilterPaneModule { }