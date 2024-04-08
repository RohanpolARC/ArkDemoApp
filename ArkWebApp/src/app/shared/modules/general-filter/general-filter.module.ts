import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralFilterComponent } from './general-filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MultiSelectModule } from '../../components/multi-select/multi-select.module';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';



@NgModule({
  declarations: [
    GeneralFilterComponent
  ],
  imports: [
    CommonModule,

    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    MatSelectModule,
    MultiSelectModule,
    MatSlideToggleModule,
    ReactiveFormsModule

  ],
  exports:[
    GeneralFilterComponent
  ]
})
export class GeneralFilterModule { }
