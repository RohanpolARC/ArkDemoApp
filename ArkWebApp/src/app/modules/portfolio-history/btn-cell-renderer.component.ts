import { Component, OnDestroy } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import {UpdateGirModalComponent} from './update-gir-modal/update-gir-modal.component'

@Component({
  selector: 'btn-cell-renderer',
  template: `
 
 <span [hidden]="editable" (click)="openUpdateGirModal()">
  <mat-icon [ngStyle]="{color:'#285170','cursor':'pointer'}" >edit</mat-icon>
  </span>
  <span [hidden]="!editable" (click)="btnFlickedHandler()">
  <mat-icon [ngStyle]="{color:'#0590ca','cursor':'pointer'}">save</mat-icon>
  </span>
  <span [hidden]="!editable" (click)="btnTickedHandler()">
  <mat-icon [ngStyle]="{'margin-left':'15px',color:'#102439','cursor':'pointer'}">undo</mat-icon>
  </span>
 
  `,
})
export class BtnCellRenderer implements ICellRendererAngularComp, OnDestroy {
  private params: any;
  public data: any; 
  public editable:boolean = false;
  public editingCells;
  public rowDataEarlier;
  public rowNode;
  public  prevRow;
  public dialogRef;
  public rowData;

  constructor(public dialog: MatDialog){

  }

  agInit(params: any): void {
    this.params = params;
    this.data=params.data;
   
  }


  openUpdateGirModal(){

  this.rowNode=this.params.api.getRowNode(this.params.node.id);
  this.rowData = this.rowNode.data

  this.dialogRef = this.dialog.open(UpdateGirModalComponent,{data:this.rowNode})

  this.dialogRef.afterClosed().subscribe(result => {
    if(result.event == 'Update'){
      const rowNode = this.params.api.getRowNode(this.params.node.id);
      console.log(rowNode)
       rowNode.setData(result.data);
    }
  });
}

  




  btnClickedHandler() {
  //  this.params.clicked(this.params.value);
  console.log("**************************Edit***************************")
  console.log(this.params)
  console.log(this.params.node.id)

  this.rowDataEarlier=this.params.api.getRowNode(this.params.node.id);
  this.prevRow = this.rowDataEarlier.data

  console.log("Row data earlier")
  console.log( this.rowDataEarlier)


  this.params.api.startEditingCell( { rowIndex: this.params.node.rowIndex, colKey: 'fxRateBaseEffective'});
    //this.editable=true
   // console.log(event)
   
  }

  btnFlickedHandler() {
   // this.params.clicked(this.params.value);
 console.log("**************************Update***************************")
   this.params.api.stopEditing(false);
   // console.log(event)
    console.log(this.params)
    this.editable=true
    this.refresh()
  }

  btnTickedHandler() {
  //  this.params.clicked(this.params.value)

  console.log("**************************Undo***************************")

  //  debugger

    console.log("Undo Performing")

    const rowNode = this.params.api.getRowNode(this.params.node.id);
  console.log(rowNode)
   rowNode.setData(this.prevRow);

   this.params.api.stopEditing(true);
   this.editable=true
    console.log("Undo Performed")

  }

  refresh(){

    this.editingCells = this.params.api.getEditingCells();
    this.editable = this.editingCells.some((cell) => {
      return cell.rowIndex === this.params.node.rowIndex;
    });

        return true
  }

  ngOnDestroy() {
    // no need to remove the button click handler 
    // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
  }

}