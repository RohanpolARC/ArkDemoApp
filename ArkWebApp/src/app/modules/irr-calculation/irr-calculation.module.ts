import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IrrCalculationComponent } from './irr-calculation.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PortfolioSaveRunModelComponent } from './portfolio-save-run-model/portfolio-save-run-model.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { IrrResultComponent } from './irr-result/irr-result.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { PortfolioModellerComponent } from './portfolio-modeller/portfolio-modeller.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IrrCalculationRoutingModule } from './irr-calculation-routing.module';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { InputDateAdapter } from 'src/app/shared/providers/date-adapter';
import { Platform } from '@angular/cdk/platform';
import { MonthlyReturnsComponent } from './monthly-returns/monthly-returns.component';

@NgModule({
  declarations: [
    IrrCalculationComponent,
    PortfolioSaveRunModelComponent,
    IrrResultComponent,
    PortfolioModellerComponent,
    MonthlyReturnsComponent
  ],
  imports: [
    CommonModule,
    IrrCalculationRoutingModule,

    AdaptableAngularAgGridModule,
    AgGridModule.withComponents([]),
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatInputModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},  
    {provide: DateAdapter, useClass: InputDateAdapter, deps: [MAT_DATE_LOCALE, Platform]},
    DatePipe
  ],
  exports: []
})
export class IrrCalculationModule { }
