import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { FacilityDetailComponent } from './facility-detail.component';
import { FacilityDetailModel } from 'src/app/shared/models/FacilityDetailModel';
import { Subscription } from 'rxjs';
import { FacilityDetailService } from 'src/app/core/services/FacilityDetails/facility-detail.service';
import { MsalUserService } from '../../core/services/Auth/msaluser.service'
import { DataService } from 'src/app/core/services/data.service';
import { ICellRendererParams } from '@ag-grid-community/core';

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

    if(!this.componentParent.lockedit){
      this.params.node.data['editing'] = true
      this.componentParent.lockedit = true

            // getRowNode().data returns references to the cell, so update in grid gets reflected here, JSON.parse(JSON.stringify()) just creates the copy of the object data, instead of reference.
      this.originalRowNodeData = JSON.parse(JSON.stringify(this.params.api.getRowNode(this.params.node.id).data));
      this.originalRowNodeID = this.params.node.id;
    }

    if((!this.componentParent.lockedit)|| (this.params.node.data?.['editing']===true)){

      let oCols: string[] = ['dealTypeCS', 'expectedDate', 'expectedPrice', 'maturityPrice', 'spreadDiscount', 'isOverride'];
      this.params.columnApi.setColumnsVisible(oCols, true)
      oCols.forEach((c) => {
        this.params.api.startEditingCell({ 
          rowIndex: this.params.node.rowIndex, colKey: c
        });      
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

    let node = this.componentParent.getEditingRow()
    this.params.api?.getRowNode(node.id)?.setData(this.originalRowNodeData);
    this.componentParent.clearEditingState()
    this.originalRowNodeData = this.originalRowNodeID = null;
    this.componentParent.gridApi?.stopEditing(true);
    this.componentParent.gridApi.onSortChanged()

    this.params.api.refreshCells({
      force: true,
      suppressFlash: true
    })
  }

  getModel(): FacilityDetailModel{
    let model: FacilityDetailModel = <FacilityDetailModel>{};
    let node = this.componentParent.getEditingRow()
    let data = node?.data

    if(data?.expectedDate != null){  
      model.expectedDate = (data?.expectedDate === null) ? null : data?.expectedDate.split('/').reverse().join('/');  
    }
    else model.expectedDate = null

    model.dealTypeCS = data?.dealTypeCS;
    model.assetID = (data?.assetID === null) ? null : parseInt(data?.assetID);
    model.expectedPrice = (data?.expectedPrice === null) ? null : parseFloat(data?.expectedPrice);
    model.maturityPrice = (data?.maturityPrice === null) ? null : parseFloat(data?.maturityPrice);
    model.spreadDiscount = (data?.spreadDiscount === null) ? null : parseFloat(data?.spreadDiscount);
    model.isOverride = Boolean(data?.isOverride);
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

          if(this.getModel().isOverride){
            this.params.api.getRowNode(this.params.node.id).setDataValue('modifiedBy', this.msalUserService.getUserName());
            this.params.api.getRowNode(this.params.node.id).setDataValue('modifiedOn', new Date());  
          }
          this.componentParent.clearEditingState()
          this.componentParent.gridApi.onSortChanged()
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

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
  }

}
