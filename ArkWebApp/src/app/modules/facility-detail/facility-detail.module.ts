import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityDetailComponent } from './facility-detail.component';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
import { ActionCellRendererComponent } from './action-cell-renderer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AggridMaterialDatepickerComponent } from './aggrid-material-datepicker/aggrid-material-datepicker.component';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { InputDateAdapter } from 'src/app/shared/providers/date-adapter';
import { Platform } from '@angular/cdk/platform';
import { DateAdapter } from '@angular/material/core';
import { CheckboxEditorComponent } from 'src/app/shared/components/checkbox-editor/checkbox-editor.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
