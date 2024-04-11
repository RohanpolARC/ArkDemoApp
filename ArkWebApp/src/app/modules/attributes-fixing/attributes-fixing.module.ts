import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttributesFixingComponent } from './attributes-fixing.component';
import { AttributesFixingRoutingModule } from './attributes-fixing-routing.module';
import { AgGridModule } from '@ag-grid-community/angular';
import {  MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { FixingDetailsFormComponent } from './fixing-details-form/fixing-details-form.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ReactiveFormsModule } from '@angular/forms';
import {  MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationPopupComponent } from 'src/app/shared/components/confirmation-popup/confirmation-popup.component';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';


@NgModule({
  declarations: [
    AttributesFixingComponent,
    FixingDetailsFormComponent,
    ConfirmationPopupComponent

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
    MatSelectModule,
    MatIconModule,

    DetailedViewModule
  ]
})
export class AttributesFixingModule { }
