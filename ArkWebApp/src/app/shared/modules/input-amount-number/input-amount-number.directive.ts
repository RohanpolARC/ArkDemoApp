import { formatNumber } from '@angular/common';
import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MAT_LEGACY_INPUT_VALUE_ACCESSOR as MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/legacy-input';

@Directive({
  selector: 'input[InputAmountNumber]',
  providers: [
    { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: InputAmountNumberDirective },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputAmountNumberDirective), multi: true }
  ]
})
export class InputAmountNumberDirective {

  locale = 'en';
  decimalMarker: string;

  constructor(private element: ElementRef<HTMLInputElement>) {
  }

  private _value: string | null;

  get value(): string | null {
    return this._value;
  }

  @Input('value')
  set value(value: string | null) {
    this._value = value;
    this.formatValue(value);
  }

  @HostListener('input', ['$event.target.value'])
  input(value) {

    this._value = this.formatAmount(value);

    // here to notify Angular Validators
    this._onChange(this._value);
  }

  @HostListener('blur')
  _onBlur() {
    /**
     * Adding thousand separators
     */
    this.formatValue(this._value);
  }

  @HostListener('focus')
  onFocus() {
    // this.unFormatValue();
  }

  _onChange(value: any): void {}

  /**
   * @param value
   * apply formatting on value assignment
   */
  writeValue(value: any) {
    this._value = value;
    this.formatValue(this._value);
  }

  registerOnChange(fn: (value: any) => void) {
    this._onChange = fn;
  }

  registerOnTouched() {}

  private formatAmount(input: string | number | null): string {
    if (input === null) {
      return '';
    }
    
    const cleanInput = String(input).replace(/[^0-9.-]/g, '');
    if (cleanInput === '') {
      return '';
    }
  
    const amount = Number(cleanInput);
    if (isNaN(amount)) {
      return '';
    }
    
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  private formatValue(value: string | number | null) {
    
    if (value === null) {
      this.element.nativeElement.value = '';
      return;
    }

    this.element.nativeElement.value = this.formatAmount(value)
  }
}
