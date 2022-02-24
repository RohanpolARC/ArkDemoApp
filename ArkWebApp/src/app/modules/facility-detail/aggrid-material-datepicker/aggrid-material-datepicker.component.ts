import { Component, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { ICellEditorParams } from '@ag-grid-community/all-modules';

@Component({
  selector: 'app-aggrid-material-datepicker',
  templateUrl: './aggrid-material-datepicker.component.html',
  styleUrls: ['./aggrid-material-datepicker.component.scss']
})
export class AggridMaterialDatepickerComponent implements OnInit, ICellEditorAngularComp {

  constructor() { }
  params: ICellEditorParams;

  inputDate: Date = null;

  agInit(params: ICellEditorParams): void {
    this.params = params;    
  }

  getValue() {
    return this.inputDate;
  }
  
  ngOnInit(): void {
  }

}
