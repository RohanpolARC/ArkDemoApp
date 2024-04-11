import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { PortfolioManagerComponent } from './portfolio-manager.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { UpdateCellRendererComponent } from './update-cell-renderer/update-cell-renderer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatAutocompleteEditorComponent } from 'src/app/shared/components/mat-autocomplete-editor/mat-autocomplete-editor.component';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApprovalComponent } from './approval/approval.component';
import { ApprovalActionCellRendererComponent } from './approval-action-cell-renderer/approval-action-cell-renderer.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { PortfolioMappingRoutingModule } from './portfolio-mapping-routing.module';

@NgModule({
  declarations: [
    PortfolioManagerComponent,
    UpdateCellRendererComponent,
    ApprovalComponent,
    ApprovalActionCellRendererComponent,
    MatAutocompleteEditorComponent
  ],
  imports: [
    CommonModule,
    PortfolioMappingRoutingModule,
    
    AdaptableAngularAgGridModule,
    AgGridModule,

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