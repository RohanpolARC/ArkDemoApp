import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-aggrid-mat-checkbox-editor',
  templateUrl: './aggrid-mat-checkbox-editor.component.html',
  styleUrls: ['./aggrid-mat-checkbox-editor.component.scss']
})
export class AggridMatCheckboxEditorComponent implements ICellRendererAngularComp {

  params: ICellRendererParams;
  checked: boolean;

  showCheckbox: ((params: ICellRendererParams) => boolean) = ((params) => true);
  disableCheckbox: ((params: ICellRendererParams) => boolean) = ((params) => false);
  onCheckboxChanged: (params: ICellRendererParams, boolVal: boolean) => void = ((params, boolVal) => {});
  defaultVal: (params: ICellRendererParams) => boolean = ((params) => false); 
  
  constructor() { }

  initHelperFns(params: ICellRendererParams<any, any>): void {

    if(params?.['showCheckbox'])
      this.showCheckbox = params?.['showCheckbox'];
    if(params?.['disableCheckbox'])
      this.disableCheckbox = params?.['disableCheckbox'];
    if(params?.['checkboxChanged'])
      this.onCheckboxChanged = params?.['checkboxChanged'];
    if(params?.['defaultVal'])
      this.defaultVal = params?.['defaultVal'];
  }

  agInit(params: ICellRendererParams<any, any>): void {
    this.params = params;
    // this.checked = params.value;

    this.initHelperFns(params)
    
    if(this.defaultVal)
      this.checked = this.defaultVal(params);
  }
  
  refresh(params: ICellRendererParams<any, any>): boolean {
    this.params = params;
    this.initHelperFns(params);   

    // this.onCheckboxChanged()

    return false;
  }

  onModelChanged(boolVal: boolean){
    this.checked = boolVal;

    let colid: string = this.params.column.getColId();
    this.params.data[colid] = boolVal;

    if(this.onCheckboxChanged)
      this.onCheckboxChanged(this.params, boolVal);
  }
} 