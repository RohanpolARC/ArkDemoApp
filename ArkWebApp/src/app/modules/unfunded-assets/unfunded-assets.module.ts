import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

import { UnfundedAssetsRoutingModule } from './unfunded-assets-routing.module';
import { UnfundedAssetsComponent } from './unfunded-assets.component';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { UnfundedAssetsEditorComponent } from './unfunded-assets-editor/unfunded-assets-editor.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { InputAmountNumberModule } from 'src/app/shared/modules/input-amount-number/input-amount-number.module';

@NgModule({
  declarations: [
    UnfundedAssetsComponent,
    UnfundedAssetsEditorComponent,
  ],
  imports: [
    CommonModule,
    UnfundedAssetsRoutingModule,

    AgGridModule,
    AdaptableAngularAgGridModule,
    ReactiveFormsModule,
    
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    InputAmountNumberModule
  ],
  providers:[
    UnfundedAssetsService,
    DecimalPipe,
    CurrencyPipe
  ]
})
export class UnfundedAssetsModule { }
