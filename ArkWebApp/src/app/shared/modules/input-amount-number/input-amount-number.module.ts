import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputAmountNumberDirective } from './input-amount-number.directive';

@NgModule({
  declarations: [
    InputAmountNumberDirective
  ]
  ,
  imports: [
    CommonModule
  ],
  exports: [
    InputAmountNumberDirective
  ]
})
export class InputAmountNumberModule { }
