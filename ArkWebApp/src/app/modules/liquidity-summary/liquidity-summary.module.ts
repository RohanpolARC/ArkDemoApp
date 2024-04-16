import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { LiquiditySummaryComponent } from './liquidity-summary.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttributeEditorComponent } from './attribute-editor/attribute-editor.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UpdateCellRendererComponent } from './update-cell-renderer/update-cell-renderer.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { AttributeGroupRendererComponent } from './attribute-group-renderer/attribute-group-renderer.component';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';
import { LiquiditySummaryRoutingModule } from './liquidity-summary-routing.module';
import { ConfirmationModule } from 'src/app/shared/modules/confirmation/confirmation.module';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';
import { SsrsReportViewerModule } from 'src/app/shared/modules/ssrs-report-viewer/ssrs-report-viewer.module';

@NgModule({
  declarations: [
    LiquiditySummaryComponent,
    AttributeEditorComponent,
    UpdateCellRendererComponent,
    AttributeGroupRendererComponent
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

    DetailedViewModule,

    DetailedViewModule,
    SsrsReportViewerModule
  ],
  providers: [
    DecimalPipe,
    CurrencyPipe,
    UnfundedAssetsService
  ]
})
export class LiquiditySummaryModule { }
