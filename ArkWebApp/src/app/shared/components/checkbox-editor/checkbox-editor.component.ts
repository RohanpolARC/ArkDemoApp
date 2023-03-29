import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
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
  isVisible: boolean=true;
  constructor() { }

  agInit(params: ICellRendererParams): void {

    this.params = params
    this.checked = params.value;
    this.editableRowID = params?.['editableRowID'];
    if(params?.['screen']==='gir editor'){
      if(params.node.group===true){
        this.isVisible = false
      }else if(params.data['isEditable']===false){
        this.isVisible = false
      }
    }

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

  ngOnInit(): void { }
}
