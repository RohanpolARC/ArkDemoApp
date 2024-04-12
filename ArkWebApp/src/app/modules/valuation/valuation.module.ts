import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValuationRoutingModule } from './valuation-routing.module';
import { ValuationComponent } from './valuation.component';
import { ValuationGridComponent } from './valuation-grid/valuation-grid.component';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from '@ag-grid-community/angular';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { ValuationGridService } from './service/valuation-grid.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MarkOverrideMasterComponent } from './mark-override-master/mark-override-master.component';
import { AggridMatCheckboxEditorModule } from 'src/app/shared/modules/aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor.module';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { GridCheckboxUtilService } from './service/grid-checkbox-util.service';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

@NgModule({
  declarations: [
    ValuationComponent,
    ValuationGridComponent,
    MarkOverrideMasterComponent,
  ],
  imports: [
    CommonModule,
    ValuationRoutingModule,
    MatCardModule,
    AgGridModule,
    AdaptableAngularAgGridModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    AggridMatCheckboxEditorModule, 
    DetailedViewModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    MatSelectModule,
    ReactiveFormsModule   
    
  ],
  providers: [
    ValuationGridService,
    GridCheckboxUtilService
  ]
})
export class ValuationModule { }
