import { Component, OnDestroy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'btn-cell-renderer',
  template: `
 <span *ngIf="!editable">
  <mat-icon [ngStyle]="{color:'#285170','cursor':'pointer'}" (click)="btnClickedHandler($event)">edit</mat-icon>
  </span>
  <span *ngIf="editable">
  <mat-icon [ngStyle]="{color:'#0590ca','cursor':'pointer'}" (click)="btnFlickedHandler($event)">save</mat-icon>
  <mat-icon [ngStyle]="{'margin-left':'15px',color:'#102439','cursor':'pointer'}" (click)="btnTickedHandler($event)">undo</mat-icon>
  </span>
  `,
})
export class BtnCellRenderer implements ICellRendererAngularComp, OnDestroy {
  private params: any;
  public data: any; 
  public editable:boolean = false;
  public editingCells;
//  public isCurrentRowEditing;

  agInit(params: any): void {
    this.params = params;
    this.data=params.data;
   
  }



  btnClickedHandler(event) {
  //  this.params.clicked(this.params.value);
    this.params.api.startEditingCell( { rowIndex: this.params.node.rowIndex, colKey: 'fxRateBaseEffective'});
    //this.editable=true
    console.log(event)
    console.log(this.params.value)
  }

  btnFlickedHandler(event) {
   // this.params.clicked(this.params.value);
    this.params.api.stopEditing(false);
    console.log(event)
    console.log(this.params)
  }

  btnTickedHandler(event) {
  //  this.params.clicked(this.params.value);
    this.params.api.stopEditing(true);
   this.params.api.undoCellEditing()
    console.log(event)
    console.log(this.params)
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