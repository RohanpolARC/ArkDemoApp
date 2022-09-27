import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss']
})

/**
 * Presentational component for ng-multiselect-dropdown
 */
export class MultiSelectComponent {

  @Input() placeholder: string
  @Input() settings: IDropdownSettings 
  @Input() dropdownData: any[] = []
  @Input() selectedDropdownData?: any[] = []

  @Output() onSelectCallback = new EventEmitter<any>();
  @Output() onSelectAllCallback = new EventEmitter<any>();
  @Output() onDeSelectCallback = new EventEmitter<any>();
  @Output() onFilterChangeCallback = new EventEmitter<any>();
  @Output() onDropdownCloseCallback = new EventEmitter<any>();

  @Output() onNgModelChangeCallback = new EventEmitter<any>();
  constructor() { }

  onSelect(items: any){
    this.onSelectCallback.emit(items);
  }

  onSelectAll(items: any){
    this.onSelectAllCallback.emit(items);
  }

  onDeSelect(items: any){
    this.onDeSelectCallback.emit(items);
  }

  onFilterChange(items: any){
    this.onFilterChangeCallback.emit(items);
  }

  onDropdownClose(items: any){
    this.onDropdownCloseCallback.emit(items);
  }

  onModelChange(values){
    this.onNgModelChangeCallback.emit(this.selectedDropdownData);
  }

}
