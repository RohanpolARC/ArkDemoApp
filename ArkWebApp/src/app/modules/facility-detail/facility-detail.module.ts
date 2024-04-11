import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityDetailComponent } from './facility-detail.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { ActionCellRendererComponent } from './action-cell-renderer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { AggridMaterialDatepickerComponent } from './aggrid-material-datepicker/aggrid-material-datepicker.component';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { InputDateAdapter } from 'src/app/shared/providers/date-adapter';
import { Platform } from '@angular/cdk/platform';
import { DateAdapter } from '@angular/material/core';
import { CheckboxEditorComponent } from 'src/app/shared/components/checkbox-editor/checkbox-editor.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { FacilityDetailRoutingModule } from './facility-detail-routing.module';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';

@NgModule({
  declarations: [
    FacilityDetailComponent,
    ActionCellRendererComponent,
    AggridMaterialDatepickerComponent,
    CheckboxEditorComponent
  ],
  imports: [    
    CommonModule,
    FacilityDetailRoutingModule,

    AdaptableAngularAgGridModule,
    AgGridModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatCheckboxModule,

    DetailedViewModule,

  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},  
    {provide: DateAdapter, useClass: InputDateAdapter, deps: [MAT_DATE_LOCALE, Platform]}
  ]
})
export class FacilityDetailModule { }
