import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { FacilityDetailComponent } from './facility-detail.component';
import { FacilityDetailModel } from 'src/app/shared/models/FacilityDetailModel';
import { Subscription } from 'rxjs';
import { FacilityDetailService } from 'src/app/core/services/FacilityDetails/facility-detail.service';
import {MsalUserService} from '../../core/services/Auth/msaluser.service'
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-action-cell-renderer',
  templateUrl: './action-cell-renderer.component.html',
  styleUrls: ['./action-cell-renderer.component.scss']
})
export class ActionCellRendererComponent implements ICellRendererAngularComp {

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
              private msalUserService: MsalUserService,
              private dataSvc: DataService) { }

  originalRowNodeData: any;
  originalRowNodeID: any;

  onEditClick(){
    // this.startEditing();           // No R/W access check

      // R/W access check

    if(this.componentParent.isWriteAccess){
      this.startEditing();
    }
    else{
      this.dataSvc.setWarningMsg('Unauthorized', 'Dismiss', 'ark-theme-snackbar-error')   
    }
  }

  startEditing(){
    if(this.componentParent.getSelectedRowID() === null){
      this.componentParent.setSelectedRowID(this.params.node.rowIndex);

            // getRowNode().data returns references to the cell, so update in grid gets reflected here, JSON.parse(JSON.stringify()) just creates the copy of the object data, instead of reference.
      this.originalRowNodeData = JSON.parse(JSON.stringify(this.params.api.getRowNode(this.params.node.id).data));
      this.originalRowNodeID = this.params.node.id;
    }

    if(this.componentParent.getSelectedRowID() === null || (this.componentParent.getSelectedRowID() === this.params.node.rowIndex)){

      this.params.columnApi.setColumnsVisible(['expectedDate', 'expectedPrice', 'maturityPrice', 'spreadDiscount', 'isOverride'], true)
      this.params.api.startEditingCell({ 
        rowIndex: this.params.node.rowIndex, colKey: 'expectedPrice'
      });    
      this.params.api.startEditingCell({ 
        rowIndex: this.params.node.rowIndex, colKey: 'maturityPrice'
      });
      this.params.api.startEditingCell({ 
        rowIndex: this.params.node.rowIndex, colKey: 'spreadDiscount'
      });
      this.params.api.startEditingCell({ 
        rowIndex: this.params.node.rowIndex, colKey: 'expectedDate'
      });
      this.params.api.startEditingCell({
        rowIndex: this.params.node.rowIndex, colKey: 'isOverride'
      })

      this.params.api.refreshCells({
        force: true,
        suppressFlash: true
      })

    }
    else{
      this.dataSvc.setWarningMsg('Please save the existing entry', 'Dismiss', 'ark-theme-snackbar-warning')   
    }
  }

  undoEdit(){
    this.params.api?.getRowNode(this.originalRowNodeID)?.setData(this.originalRowNodeData);
    this.originalRowNodeData = this.originalRowNodeID = null;
    this.componentParent.setSelectedRowID(null);
    this.params.api.refreshCells({
      force: true,
      suppressFlash: true
    })
  }

  getModel(): FacilityDetailModel{
    let model: FacilityDetailModel = <FacilityDetailModel>{};
    let data = this.params.data;

    if(data.expectedDate != null){  
      model.expectedDate = (data.expectedDate === null) ? null : data.expectedDate.split('/').reverse().join('/');  
    }
    else model.expectedDate = null

    model.assetID = (data.assetID === null) ? null : parseInt(data.assetID);
    model.expectedPrice = (data.expectedPrice === null) ? null : parseFloat(data.expectedPrice);
    model.maturityPrice = (data.maturityPrice === null) ? null : parseFloat(data.maturityPrice);
    model.spreadDiscount = (data.spreadDiscount === null) ? null : parseFloat(data.spreadDiscount);
    model.isOverride = Boolean(data.isOverride);
    model.modifiedOn = new Date();
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

          if(this.getModel().isOverride){
            this.params.api.getRowNode(this.params.node.id).setDataValue('modifiedBy', this.msalUserService.getUserName());
            this.params.api.getRowNode(this.params.node.id).setDataValue('modifiedOn', new Date());  
          }
          this.params.api.refreshCells({
            force: true,
            suppressFlash: true
          })
          this.dataSvc.setWarningMsg(`Saved successfully`, 'Dismiss', 'ark-theme-snackbar-success');  
        }
      },
      error: error => {
        console.error(error)
        this.dataSvc.setWarningMsg(`Failed to save`, 'Dismiss', 'ark-theme-snackbar-error'); 
      }
    }))
  }

}
