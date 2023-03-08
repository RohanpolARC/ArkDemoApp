import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';

import { CapitalActivityComponent } from './capital-activity.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddCapitalModalComponent } from './add-capital-modal/add-capital-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { UpdateConfirmComponent } from './update-confirm/update-confirm.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { LinkInvestorModalComponent } from './link-investor-modal/link-investor-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';
import { DropzoneDirective } from './bulk-upload/dropzone.directive';
import { CapitalActivityRoutingModule } from './capital-activity-routing.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputAmountNumberModule } from 'src/app/shared/modules/input-amount-number/input-amount-number.module';

@NgModule({
  declarations: [
    CapitalActivityComponent,
    AddCapitalModalComponent,
    UpdateConfirmComponent,
    LinkInvestorModalComponent,
    BulkUploadComponent,
    DropzoneDirective,
  ],
  /** Add all pop-up modal components here, for this module */
  entryComponents: [AddCapitalModalComponent, UpdateConfirmComponent, BulkUploadComponent],
  imports: [
    CommonModule,
    CapitalActivityRoutingModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSelectModule,
    MatInputModule,
    MatCardModule,
    AdaptableAngularAgGridModule,
    AgGridModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatTooltipModule,
    MatCheckboxModule,

    InputAmountNumberModule
  ],
  exports:[CapitalActivityComponent]
})
export class CapitalActivityModule { }
