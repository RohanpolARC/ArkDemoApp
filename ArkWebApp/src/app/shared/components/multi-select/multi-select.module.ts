import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectComponent } from './multi-select.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    MultiSelectComponent
  ],
  imports: [
    CommonModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule
  ],
  exports: [
    MultiSelectComponent
  ]
})

export class MultiSelectModule { }
