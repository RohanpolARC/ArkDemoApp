import { ICellEditorParams } from '@ag-grid-community/all-modules';
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
  value: any
  subscriptions: Subscription[] = []

  constructor() { }

  agInit(params: ICellEditorParams): void {

    this.params = params;
    this.options = params?.['options'];
    this.field.setValue(params.value, { emitEvent: false })
  }

  getValue() {
    return this.value  
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

    this.subscriptions.push(this.field.valueChanges.subscribe({
      next: (value) => {
        this.value = value;
      },
      error: (error) => {
        console.error(error)
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
