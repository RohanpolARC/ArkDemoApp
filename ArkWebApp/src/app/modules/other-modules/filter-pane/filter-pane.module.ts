import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractHistoryFilterComponent } from './contract-history-filter/contract-history-filter.component';
import { MultiSelectModule } from 'src/app/shared/components/multi-select/multi-select.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ContractHistoryFilterComponent
  ],
  imports: [
    CommonModule,
    MultiSelectModule,
    MatSlideToggleModule,
    FormsModule
  ],
  exports: [
    ContractHistoryFilterComponent
  ]
})
export class FilterPaneModule { }
