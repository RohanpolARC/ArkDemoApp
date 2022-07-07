import { Component, OnDestroy } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import {UpdateGirModalComponent} from './update-gir-modal/update-gir-modal.component'

@Component({
  selector: 'btn-cell-renderer',
  template: `
 
 <span  (click)="openUpdateGirModal()">
  <mat-icon [ngStyle]="{color:'#285170','cursor':'pointer'}" >edit</mat-icon>
  </span>
  `,
})
export class BtnCellRenderer implements ICellRendererAngularComp, OnDestroy {
  private params: any;
  public data: any; 
  public dialogRef;
  public rowData;

  public gridApi
  
  constructor(public dialog: MatDialog){

  }

  agInit(params: any): void {
    this.params = params;
    this.data=params.data;
   
  }


  openUpdateGirModal(){

  this.dialogRef = this.dialog.open(UpdateGirModalComponent,{data: this.params.node })
  this.dialogRef.afterClosed().subscribe(result => {
  });
}

  refresh(){
    return true
  }

  ngOnDestroy() {
    // no need to remove the button click handler 
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }

}