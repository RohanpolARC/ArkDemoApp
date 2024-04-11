import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RefDataManagerRoutingModule } from './ref-data-manager-routing.module';
import { RefDataManagerComponent } from './ref-data-manager.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddRefDataFormComponent } from './add-ref-data-form/add-ref-data-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';


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
