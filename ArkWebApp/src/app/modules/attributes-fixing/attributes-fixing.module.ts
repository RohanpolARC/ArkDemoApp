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
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationPopupComponent } from 'src/app/shared/components/confirmation-popup/confirmation-popup.component';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';
import { DisableDirective } from 'src/app/shared/directives/disable.directive';


@NgModule({
  declarations: [
    AttributesFixingComponent,
    FixingDetailsFormComponent,
    ConfirmationPopupComponent,
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

    DetailedViewModule,
    DisableDirective
  ]
})
export class AttributesFixingModule { }
