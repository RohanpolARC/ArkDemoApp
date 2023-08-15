import { ICellEditorParams } from '@ag-grid-community/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-mat-autocomplete-editor',
  templateUrl: './mat-autocomplete-editor.component.html',
  styleUrls: ['./mat-autocomplete-editor.component.scss']
})
export class MatAutocompleteEditorComponent implements ICellEditorAngularComp, OnInit, OnDestroy {

  field = new FormControl('');
  options: string[] 
  filteredOptions: Observable<string[]>
  params: ICellEditorParams;
  subscriptions: Subscription[] = []
  isStrict: boolean = false
  oldValRestoreOnStrict: boolean = false
  oldVal

  themeSizes:{
    rowHeight: number;
    headerHeight: number;
  }
  customMatAutoCompleteStyle: string = ''

  constructor() { }

  agInit(params: ICellEditorParams): void {

    this.oldVal = params.value;
    this.params = params;
    this.options = params?.['options'];
    this.isStrict = params?.['isStrict'] ? true : false;
    this.oldValRestoreOnStrict = params?.['oldValRestoreOnStrict'] ? true : false;
    this.field.setValue(params.value, { emitEvent: false })
    this.themeSizes =  params.api.getSizesForCurrentTheme()
    if(this.themeSizes.rowHeight<40){
      this.customMatAutoCompleteStyle = 'font-size: 0.3rem;'
    }else if(this.themeSizes.rowHeight>40){
      this.customMatAutoCompleteStyle = 'font-size: 0.55rem;'
    }
  }

  getValue() {
    if(this.isStrict && !this.options.includes(this.field.value)){
      if(this.oldValRestoreOnStrict)
        return this.oldVal
      else null;
    }
    else return this.field.value;  
  }

  _filter(value: string): string[] {
    const filterVal = String(value).toLowerCase();

    return (this.options as any[])?.filter(op => String(op).toLowerCase().includes(filterVal))   
  }

  ngOnInit(): void {
    this.filteredOptions = this.field.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
