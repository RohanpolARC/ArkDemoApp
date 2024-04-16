import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ConfirmPopupComponent } from './confirm-popup/confirm-popup.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    ConfirmationComponent,
    ConfirmPopupComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  exports:[
    ConfirmationComponent,
    ConfirmPopupComponent
  ]
})
export class ConfirmationModule { }
