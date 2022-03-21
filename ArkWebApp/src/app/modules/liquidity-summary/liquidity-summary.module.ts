import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquiditySummaryComponent } from './liquidity-summary.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddModalComponent } from './add-modal/add-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    LiquiditySummaryComponent,
    AddModalComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MatDialogModule,
    AgGridModule.withComponents([]),
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatAutocompleteModule
  ]
})
export class LiquiditySummaryModule { }
