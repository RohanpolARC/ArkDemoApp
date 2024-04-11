import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FeePresetsComponent } from './fee-presets.component';
import { FeePresetsRoutingModule } from './fee-presets-routing.module';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatIconModule } from '@angular/material/icon';
import { PresetsFormComponent } from './presets-form/presets-form.component';
import { MatStepperModule } from '@angular/material/stepper';
import { FeedataFormComponent } from './feedata-form/feedata-form.component';
import { InvestmentdataFormComponent } from './investmentdata-form/investmentdata-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { InputDateAdapter } from 'src/app/shared/providers/date-adapter';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { InputAmountNumberModule } from 'src/app/shared/modules/input-amount-number/input-amount-number.module';

@NgModule({
  declarations: [
    FeePresetsComponent,
    PresetsFormComponent,
    FeedataFormComponent,
    InvestmentdataFormComponent
  ],
  imports: [
    CommonModule,
    FeePresetsRoutingModule,
    AgGridModule,
    AdaptableAngularAgGridModule,
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatSelectModule,
    MatTooltipModule,
    InputAmountNumberModule
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {showError: true},
    },
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},  
    {provide: DateAdapter, useClass: InputDateAdapter, deps: [MAT_DATE_LOCALE, Platform]}
  ]
})
export class FeePresetsModule { }
