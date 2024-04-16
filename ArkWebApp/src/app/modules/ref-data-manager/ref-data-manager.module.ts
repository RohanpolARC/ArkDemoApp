import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RefDataManagerRoutingModule } from './ref-data-manager-routing.module';
import { RefDataManagerComponent } from './ref-data-manager.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddRefDataFormComponent } from './add-ref-data-form/add-ref-data-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [
    RefDataManagerComponent,
    AddRefDataFormComponent
  ],
  imports: [
    CommonModule,
    RefDataManagerRoutingModule,

    MatCardModule,
    AgGridModule,
    AdaptableAngularAgGridModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class RefDataManagerModule { }
