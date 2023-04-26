import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ConfirmPopupComponent } from './confirm-popup/confirm-popup.component';



@NgModule({
  declarations: [
    ConfirmationComponent,
    ConfirmPopupComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ConfirmationModule { }
