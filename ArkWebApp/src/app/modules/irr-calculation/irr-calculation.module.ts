import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IrrCalculationComponent } from './irr-calculation.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatButtonModule } from '@angular/material/button';
import { PortfolioSaveRunModelComponent } from './portfolio-save-run-model/portfolio-save-run-model.component';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatIconModule } from '@angular/material/icon';
import { IrrResultComponent } from './irr-result/irr-result.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { PortfolioModellerComponent } from './portfolio-modeller/portfolio-modeller.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { IrrCalculationRoutingModule } from './irr-calculation-routing.module';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { InputDateAdapter } from 'src/app/shared/providers/date-adapter';
import { Platform } from '@angular/cdk/platform';
import { MonthlyReturnsComponent } from './monthly-returns/monthly-returns.component';
import { FeeCalculationModule } from '../fee-calculation/fee-calculation.module';
import { PerformanceFeeComponent } from './performance-fee/performance-fee.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FeePresetsGridComponent } from './fee-presets-grid/fee-presets-grid.component';
import { TabGroupWrapperComponent } from './tab-group-wrapper/tab-group-wrapper.component';
import { CashFlowsComponent } from './cash-flows/cash-flows.component';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { VirtualPositionFormComponent } from './virtual-position-form/virtual-position-form.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InputAmountNumberModule } from 'src/app/shared/modules/input-amount-number/input-amount-number.module';
import { AsPipeModule } from 'src/app/shared/modules/as-pipe/as-pipe.module';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { RefService } from './portfolio-modeller/ref/ref.service';
import { PortfolioManageModelComponent } from './portfolio-manage-model/portfolio-manage-model.component';
import { PortfolioManageModelGridComponent } from './portfolio-manage-model-grid/portfolio-manage-model-grid.component';

@NgModule({
  declarations: [
    IrrCalculationComponent,
    PortfolioSaveRunModelComponent,
    IrrResultComponent,
    PortfolioModellerComponent,
    MonthlyReturnsComponent,
    PerformanceFeeComponent,
    FeePresetsGridComponent,
    TabGroupWrapperComponent,
    CashFlowsComponent,
    VirtualPositionFormComponent,
    PortfolioManageModelComponent,
    PortfolioManageModelGridComponent
  ],
  imports: [
    CommonModule,
    IrrCalculationRoutingModule,

    FeeCalculationModule,
    
    AdaptableAngularAgGridModule,
    AgGridModule,
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
    MatSelectModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,

    InputAmountNumberModule,
    AsPipeModule

  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},  
    {provide: DateAdapter, useClass: InputDateAdapter, deps: [MAT_DATE_LOCALE, Platform]},
    DatePipe,
    IRRCalcService,
    RefService  
  ],
  exports: []
})
export class IrrCalculationModule { }
