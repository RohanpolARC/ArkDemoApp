import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { PortfolioManagerComponent } from './portfolio-manager.component';
import { MatCardModule } from '@angular/material/card';
import { UpdateCellRendererComponent } from './update-cell-renderer/update-cell-renderer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApprovalComponent } from './approval/approval.component';
import { ApprovalActionCellRendererComponent } from './approval-action-cell-renderer/approval-action-cell-renderer.component';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationPopupComponent } from 'src/app/shared/components/confirmation-popup/confirmation-popup.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [
    PortfolioManagerComponent,
    UpdateCellRendererComponent,
    ApprovalComponent,
    ApprovalActionCellRendererComponent,
    MatAutocompleteEditorComponent,
    ConfirmationPopupComponent
  ],
  imports: [
    CommonModule,
    AdaptableAngularAgGridModule,
    AgGridModule.withComponents([
      UpdateCellRendererComponent, MatAutocompleteEditorComponent, ApprovalActionCellRendererComponent
    ]),

    ReactiveFormsModule,

    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule
  ]
})

export class PortfolioManagerModule {}