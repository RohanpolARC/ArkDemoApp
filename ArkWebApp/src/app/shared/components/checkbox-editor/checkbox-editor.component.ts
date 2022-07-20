import { ICellEditorParams, ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellEditorAngularComp, ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkbox-editor',
  templateUrl: './checkbox-editor.component.html',
  styleUrls: ['./checkbox-editor.component.scss']
})
export class CheckboxEditorComponent implements ICellRendererAngularComp, OnInit {

  checked: boolean
  params: ICellRendererParams
  editableRowID: number
  onModelChangeCallback: (params: ICellRendererParams) => {}
  constructor() { }

  agInit(params: ICellRendererParams): void {

    this.params = params
    this.checked = params.value;
    this.editableRowID = params?.['editableRowID'];

    this.onModelChangeCallback = params?.['onCheckboxcolChanged']
  }

  refresh(params: ICellRendererParams): boolean {
    this.checked = params.value
    this.editableRowID = params?.['editableRowID'];
    this.params = params
    return true;
  }

  onModelChanged(val){
    this.checked = val;
    this.params.data[this.params.column.getColId()] = val;
    this.params.api.refreshCells({
      force: true,
      suppressFlash: true
    })

    if(this.onModelChangeCallback){
      this.onModelChangeCallback(this.params);
    }
  }

  ngOnInit(): void {
  }

}
