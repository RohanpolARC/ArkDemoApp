import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FeePresetsComponent } from './fee-presets.component';
import { FeePresetsRoutingModule } from './fee-presets-routing.module';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatIconModule } from '@angular/material/icon';
import { PresetsFormComponent } from './presets-form/presets-form.component';
import { MatStepperModule } from '@angular/material/stepper';
import { FeedataFormComponent } from './feedata-form/feedata-form.component';
import { InvestmentdataFormComponent } from './investmentdata-form/investmentdata-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatSelectModule } from '@angular/material/select';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { InputDateAdapter } from 'src/app/shared/providers/date-adapter';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule
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
