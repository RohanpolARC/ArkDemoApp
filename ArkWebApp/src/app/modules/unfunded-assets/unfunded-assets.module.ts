import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

import { UnfundedAssetsRoutingModule } from './unfunded-assets-routing.module';
import { UnfundedAssetsComponent } from './unfunded-assets.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UnfundedAssetsEditorComponent } from './unfunded-assets-editor/unfunded-assets-editor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UnfundedAssetsService } from 'src/app/core/services/UnfundedAssets/unfunded-assets.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
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
