import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IrrCalculationComponent } from './irr-calculation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PortfolioSaveRulesComponent } from './portfolio-save-rules/portfolio-save-rules.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {MatSelectModule} from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { IrrResultComponent } from './irr-result/irr-result.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  declarations: [
    IrrCalculationComponent,
    PortfolioSaveRulesComponent,
    IrrResultComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
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
    MatTabsModule
  ]
})
export class IrrCalculationModule { }
