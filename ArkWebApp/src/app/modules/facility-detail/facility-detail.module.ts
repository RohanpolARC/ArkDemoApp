import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityDetailComponent } from './facility-detail.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
import { ActionCellRendererComponent } from './action-cell-renderer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AggridMaterialDatepickerComponent } from './aggrid-material-datepicker/aggrid-material-datepicker.component';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { InputDateAdapter } from 'src/app/shared/providers/date-adapter';
import { Platform } from '@angular/cdk/platform';
import { DateAdapter } from '@angular/material/core';

@NgModule({
  declarations: [
    FacilityDetailComponent,
    ActionCellRendererComponent,
    AggridMaterialDatepickerComponent
  ],
  imports: [    
    BrowserAnimationsModule,
    CommonModule,
    AdaptableAngularAgGridModule,
    AgGridModule.withComponents([
      ActionCellRendererComponent,
      AggridMaterialDatepickerComponent
    ]),
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
    ReactiveFormsModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},  
    {provide: DateAdapter, useClass: InputDateAdapter, deps: [MAT_DATE_LOCALE, Platform]}
  ]
})
export class FacilityDetailModule { }
