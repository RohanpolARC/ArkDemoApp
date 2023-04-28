import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { LiquiditySummaryComponent } from './liquidity-summary.component';
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
import { LiquiditySummaryRoutingModule } from './liquidity-summary-routing.module';
import { ConfirmationModule } from 'src/app/shared/modules/confirmation/confirmation.module';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';

@NgModule({
  declarations: [
    LiquiditySummaryComponent,
    AttributeEditorComponent,
    UpdateCellRendererComponent,
    AttributeGroupRendererComponent,
    AddCommentComponent
  ],
  imports: [
    CommonModule,
    LiquiditySummaryRoutingModule,
    
    MatDialogModule,
    AgGridModule,
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
    MatSnackBarModule,

    ConfirmationModule,

    DetailedViewModule
  ],
  providers: [
    DecimalPipe,
    CurrencyPipe,
    UnfundedAssetsService
  ]
})
export class LiquiditySummaryModule { }
