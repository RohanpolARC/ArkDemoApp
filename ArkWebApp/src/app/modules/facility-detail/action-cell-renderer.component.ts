import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { FacilityDetailComponent } from './facility-detail.component';
import { FacilityDetailModel } from 'src/app/shared/models/FacilityDetailModel';
import { Subscription } from 'rxjs';
import { FacilityDetailService } from 'src/app/core/services/FacilityDetails/facility-detail.service';
import {MsalUserService} from '../../core/services/Auth/msaluser.service'

@Component({
  selector: 'app-action-cell-renderer',
  templateUrl: './action-cell-renderer.component.html',
  styleUrls: ['./action-cell-renderer.component.scss']
})
export class ActionCellRendererComponent implements ICellRendererAngularComp,OnInit {

  subscriptions: Subscription[] = [];
  params: ICellRendererParams;

  componentParent: FacilityDetailComponent

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.componentParent = params.context.componentParent
  }

  refresh(){
    return true   // States that it needs to be refreshed
  }

  constructor(private facilityDetailService: FacilityDetailService,
              private msalUserService: MsalUserService) { }

  originalRowNodeData: any;
  originalRowNodeID: any;

  onEditClick(){
    if(this.componentParent.isWriteAccess){
      this.startEditing();
    }
    // else{
    //   this.componentParent.setWarningMsg('You have no write access', 'Dismiss', 'ark-theme-snackbar-error')   
    // }
  }

  startEditing(){
    if(this.componentParent.getSelectedRowID() === null){
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
      this.params.api.startEditingCell({ 
        rowIndex: this.params.node.rowIndex, colKey: 'spreadDiscount'
      });

    }
    else{
      this.componentParent.setWarningMsg('Please save the existing entry', 'Dismiss', 'ark-theme-snackbar-warning')   
    }
  }

  undoEdit(){
    console.log(this.originalRowNodeData);
    this.params.api.getRowNode(this.originalRowNodeID).setData(this.originalRowNodeData);

    this.originalRowNodeData = this.originalRowNodeID = null;
    this.componentParent.setSelectedRowID(null);
    this.params.api.refreshCells({
      force: true,
      columns: ['expectedDate', 'expectedPrice', 'maturityPrice', 'spreadDiscount'],
      rowNodes: [this.params.api.getRowNode(this.params.node.id)]
    });
  }

  getModel(): FacilityDetailModel{
    let model: FacilityDetailModel = <FacilityDetailModel>{};
    let data = this.params.data;

    model.assetID = <number> data.assetID;
    model.expectedDate = <Date> data.expectedDate;
    model.expectedPrice = <number> data.expectedPrice;
    model.maturityPrice = <number> data.maturityPrice;
    model.spreadDiscount = <number> data.spreadDiscount;

    model.modifiedBy = this.msalUserService.getUserName();
    return model;
  }

  onSave(){
    this.params.api.stopEditing(true);
    this.subscriptions.push(this.facilityDetailService.putFacilityDetails(this.getModel()).subscribe({
      next: data => {

        if(data.isSuccess){
          this.originalRowNodeData = this.originalRowNodeID = null;
          this.componentParent.setSelectedRowID(null);
          this.params.api.refreshCells({
            force: true,
            columns: ['expectedDate', 'expectedPrice', 'maturityPrice', 'spreadDiscount'],
            rowNodes: [this.params.api.getRowNode(this.params.node.id)]
          });  
          
          this.componentParent.setWarningMsg(`Saved successfully`, 'Dismiss', 'ark-theme-snackbar-success');  
        }
      },
      error: error => {
        this.componentParent.setWarningMsg(`Failed to save`, 'Dismiss', 'ark-theme-snackbar-error'); 
      }
    }))
  }

  ngOnInit(): void {
  }
}
