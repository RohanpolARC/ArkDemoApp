import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { LiquiditySummaryComponent } from './liquidity-summary.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttributeEditorComponent } from './attribute-editor/attribute-editor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UpdateCellRendererComponent } from './update-cell-renderer/update-cell-renderer.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AttributeGroupRendererComponent } from './attribute-group-renderer/attribute-group-renderer.component';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';

@NgModule({
  declarations: [
    LiquiditySummaryComponent,
    AttributeEditorComponent,
    UpdateCellRendererComponent,
    AttributeGroupRendererComponent
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MatDialogModule,
    AgGridModule.withComponents([UpdateCellRendererComponent, AttributeGroupRendererComponent]),
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  providers: [
    DecimalPipe,
    UnfundedAssetsService
  ]
})
export class LiquiditySummaryModule { }
