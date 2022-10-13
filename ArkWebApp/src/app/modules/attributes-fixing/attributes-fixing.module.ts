import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttributesFixingComponent } from './attributes-fixing.component';
import { AttributesFixingRoutingModule } from './attributes-fixing-routing.module';
import { AgGridModule } from '@ag-grid-community/angular';
import {  MatCardModule } from '@angular/material/card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { FixingDetailsFormComponent } from './fixing-details-form/fixing-details-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import {  MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatOptionModule } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';


@NgModule({
  declarations: [
    AttributesFixingComponent,
    FixingDetailsFormComponent
  ],
  imports: [
    CommonModule,
    AttributesFixingRoutingModule,

    AgGridModule,
    AdaptableAngularAgGridModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatDialogModule,
    MatOptionModule,
    MatSelectModule
  ]
})
export class AttributesFixingModule { }
