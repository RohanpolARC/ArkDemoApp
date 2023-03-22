import { Component, OnDestroy } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import {UpdateGirModalComponent} from './update-gir-modal/update-gir-modal.component'
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { Subscription } from 'rxjs';
import { ICellRendererParams, RowNode } from '@ag-grid-community/core';
import { getRowNodes } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'btn-cell-renderer',
  template: `
 
 <span *ngIf="isEditable===true" (click)="openUpdateGirModal()">
  <mat-icon [ngStyle]="{color:'#285170','cursor':'pointer'}" >edit</mat-icon>
  </span>
  `,
})
export class BtnCellRenderer implements ICellRendererAngularComp, OnDestroy {
  private params: ICellRendererParams;
  data: any; 
  rowData;
  adaptableApi: AdaptableApi
  childNodes: RowNode[]

  subscription: Subscription
  isEditable: boolean = false;
  constructor(public dialog: MatDialog){ }

  agInit(params: any): void {    
    this.params = params;
    this.data = params.data;
    if(this.params.node.group){
      this.childNodes= getRowNodes(this.params.node)
      if(!this.childNodes.find(child=>child.data['isEditable']===false)){
        this.isEditable = true
      }
      //console.log(this.childNodes)
    }else{
      this.isEditable = this.params.data['isEditable']
    }
    this.adaptableApi = params.context.adaptableApi
  }

  openUpdateGirModal(){
    const dialogRef = this.dialog.open(UpdateGirModalComponent,{ 
      data: {
        node: this.params.node,
        adaptableApi: this.adaptableApi,
        gridApi: this.params.api
      }
    })
    this.subscription = dialogRef.afterClosed().subscribe(result => {
      if(dialogRef.componentInstance.isSuccess){
        this.params.api.refreshCells({
          force: true,
          suppressFlash: true
        })  
      }
    });
  }

  refresh(){
    return true
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}