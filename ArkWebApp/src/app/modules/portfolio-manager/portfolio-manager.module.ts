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

@NgModule({
  declarations: [
    PortfolioManagerComponent,
    UpdateCellRendererComponent
  ],
  imports: [
    CommonModule,
    AdaptableAngularAgGridModule,
    AgGridModule.withComponents([UpdateCellRendererComponent, MatAutocompleteEditorComponent]),
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatAutocompleteModule
  ]
})
export class PortfolioManagerModule { }
