import { ApplicationRef, Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams, RowNode } from '@ag-grid-community/all-modules';
import { FacilityDetailComponent } from './facility-detail.component';

@Component({
  selector: 'app-action-cell-renderer',
  templateUrl: './action-cell-renderer.component.html',
  styleUrls: ['./action-cell-renderer.component.scss']
})
export class ActionCellRendererComponent implements ICellRendererAngularComp,OnInit {

  params: ICellRendererParams;

  editingCells
  prevRow
  rowDataEarlier

  componentParent: FacilityDetailComponent

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.componentParent = params.context.componentParent
  }

  refresh(){

    this.editingCells = this.params.api.getEditingCells();
    this.editable = this.editingCells.some((cell) => {
      return cell.rowIndex === this.params.node.rowIndex;
    });

        return true
  }

  constructor() { }

  editable:boolean = false;

  currentRowIndex:number = null;

  originalRowNodeData: any;
  originalRowNodeID: any;

  onEditClick(){
    if(this.componentParent.isWriteAccess){
      this.startEditing();
    }
    else{
      this.componentParent.setWarningMsg('You have no write access', 'Dismiss')   
    }
  }

  startEditing(){
    if(this.componentParent.getSelectedRowID() === null){
      console.log("Calling this")
      this.componentParent.setSelectedRowID(this.params.node.rowIndex);

            // getRowNode().data returns references to the cell, so update in grid gets reflected here, JSON.parse(JSON.stringify()) just creates the copy of the object data, instead of reference.
      this.originalRowNodeData = JSON.parse(JSON.stringify(this.params.api.getRowNode(this.params.node.id).data));
      this.originalRowNodeID = this.params.node.id;
    }

    if(this.componentParent.getSelectedRowID() === null || (this.componentParent.getSelectedRowID() === this.params.node.rowIndex)){

      this.params.api.startEditingCell({ 
        rowIndex: this.params.node.rowIndex, colKey: 'expectedPrice'
      });    
      this.params.api.startEditingCell({ 
        rowIndex: this.params.node.rowIndex, colKey: 'expectedDate'
      });
      this.params.api.startEditingCell({ 
        rowIndex: this.params.node.rowIndex, colKey: 'maturityPrice'
      });
    }
    else{
      this.componentParent.setWarningMsg('Please save the existing entry', 'Dismiss')   
    }
  }

  undoEdit(){
    console.log(this.originalRowNodeData);
    this.params.api.getRowNode(this.originalRowNodeID).setData(this.originalRowNodeData);

    this.originalRowNodeData = this.originalRowNodeID = null;
    this.componentParent.setSelectedRowID(null);
    this.params.api.refreshCells({
      force: true,
      columns: ['expectedDate', 'expectedPrice', 'maturityPrice'],
      rowNodes: [this.params.api.getRowNode(this.params.node.id)]
    });
  }

  onSave(){
    this.params.api.stopEditing(true);

    this.originalRowNodeData = this.originalRowNodeID = null;
    this.componentParent.setSelectedRowID(null);
    this.params.api.refreshCells({
      force: true,
      columns: ['expectedDate', 'expectedPrice', 'maturityPrice'],
      rowNodes: [this.params.api.getRowNode(this.params.node.id)]
    });
  }

  stopEditing(){
    const rowNode = this.params.api.getRowNode(this.params.node.id);
    console.log(rowNode)
     rowNode.setData(this.prevRow);

     this.params.api.undoCellEditing();

    // this.params.api.stopEditing(true);

    this.editable=true
    console.log("Undo Performed")
  }

  ngOnInit(): void {
    console.log('Actioncell renderer called')
  }

}
