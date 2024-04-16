import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralFilterComponent } from './general-filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MultiSelectModule } from '../../components/multi-select/multi-select.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



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
