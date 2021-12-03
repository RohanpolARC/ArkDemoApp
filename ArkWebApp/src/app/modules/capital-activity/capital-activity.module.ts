import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';

import { CapitalActivityComponent } from './capital-activity.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddCapitalModalComponent } from './add-capital-modal/add-capital-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    CapitalActivityComponent,
    AddCapitalModalComponent
  ],
  /** Add all pop-up modal components here, for this module */
  entryComponents: [AddCapitalModalComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
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

  ],
  exports:[CapitalActivityComponent]
})
export class CapitalActivityModule { }
