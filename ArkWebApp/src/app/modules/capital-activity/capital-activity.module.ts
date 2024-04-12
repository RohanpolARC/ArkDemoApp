import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';

import { CapitalActivityComponent } from './capital-activity.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormComponent } from './form/form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatCardModule } from '@angular/material/card';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { LinkInvestorModalComponent } from './link-investor-modal/link-investor-modal.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { CapitalActivityRoutingModule } from './capital-activity-routing.module';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { InputAmountNumberModule } from 'src/app/shared/modules/input-amount-number/input-amount-number.module';
import { FileDropzoneModule } from 'src/app/shared/modules/file-dropzone/file-dropzone.module';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';
import { InvestmentComponent } from './investment/investment.component';
import { InvestorComponent } from './investor/investor.component';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { UtilService } from './services/util.service';
import { ComponentReaderService } from './services/component-reader.service';
import { ModalComponent } from './modal/modal.component';
import { InvestmentsPreviewComponent } from './investments-preview/investments-preview.component';
import { UploadComponent } from './bulk-upload/upload/upload.component';
import { ActivitiesGridComponent } from './bulk-upload/activities-grid/activities-grid.component';
import { NavQuarterlyGridComponent } from './bulk-upload/nav-quarterly-grid/nav-quarterly-grid.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { ConfigurationAuditComponent } from './configuration-audit/configuration-audit.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ConfigurationService } from './services/configuration.service';

@NgModule({
  declarations: [
    CapitalActivityComponent,
    FormComponent,
    LinkInvestorModalComponent,
    InvestorComponent,
    InvestmentComponent,
    ModalComponent,
    InvestmentsPreviewComponent,
    UploadComponent,
    ActivitiesGridComponent,
    NavQuarterlyGridComponent,
    ConfigurationComponent,
    ConfigurationAuditComponent,
  ],
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
    MatProgressSpinnerModule,

    InputAmountNumberModule,
    FileDropzoneModule,

    DetailedViewModule
  ],
  exports:[ CapitalActivityComponent ],
  providers: [
    ComponentReaderService,
    CapitalActivityService,
    UtilService,
    ConfigurationService
  ]
})
export class CapitalActivityModule { }
