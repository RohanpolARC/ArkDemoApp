import {  ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { PortfolioManagerService } from 'src/app/core/services/PortfolioManager/portfolio-manager.service';
import { PortfolioMapping, PortfolioMappingApproval } from 'src/app/shared/models/PortfolioManagerModel';
import { ApprovalComponent } from '../approval/approval.component';
import { ConfirmPopupComponent } from 'src/app/shared/modules/confirmation/confirm-popup/confirm-popup.component';

@Component({
  selector: 'app-approval-action-cell-renderer',
  templateUrl: './approval-action-cell-renderer.component.html',
  styleUrls: ['./approval-action-cell-renderer.component.scss']
})
export class ApprovalActionCellRendererComponent implements ICellRendererAngularComp, OnDestroy{

  subscriptions: Subscription[] = []
  params: ICellRendererParams
  componentParent: ApprovalComponent
  originalRowNodeData: any;
  originalRowNodeID: string;
  
  agInit(params: ICellRendererParams): void {
    
    this.params = params;
    this.componentParent = params.context.componentParent;
  }

  refresh(params: ICellRendererParams): boolean {
    return true
  }

  constructor(
    private dataSvc: DataService,
    private portfolioManagerSvc: PortfolioManagerService,
    private dialog:MatDialog
  ) { }

/**
 * When user confirms the action of `approve` or `reject`. This makes a request to save the requested action
 * @param action `approve` or `reject`
 * @param remark based on action, if any
 */
  onConfirm(action: 'approve' | 'reject', remark: string){

    let model: PortfolioMappingApproval = <PortfolioMappingApproval>{};
    model.actionType = this.params.data['actionType'];
    model.approval = (action === 'approve');
    model.stagingID = Number(this.params.data['stagingID'])
    model.reviewer = this.dataSvc.getCurrentUserName();
    model.remark = remark;

    this.subscriptions.push(this.portfolioManagerSvc.putPortfolioMappingApproval(model).subscribe({
      next: resp => {

        if(resp.isSuccess){

          this.dataSvc.setWarningMsg(`Mapping was ${(action === 'approve') ? 'approved' : 'rejected'}`, `Dismiss`, `ark-theme-snackbar-success`)
          this.params.api.applyTransaction({
            remove: [this.params.data] 
          })
          
          // Refreshing mappings grid & approval grid
          this.componentParent.refreshMappingsEvent.emit('Refresh');
          this.componentParent.fetchPortfolioMappingStaging();
        }
      },
      error: error => {

        this.dataSvc.setWarningMsg(`Failed to ${action}`, `Dismiss`, `ark-theme-snackbar-error`)
      }
    }))

  }

  onAction(action: 'approve' | 'reject'): void {

    const dialogRef = this.dialog.open(ConfirmPopupComponent, {
      data: {
        headerText: `Are you sure you want to ${action} the request?`,
        showTextField:true,
        textFieldLabelValue:'Remark'
      },
      width:'35vw'
    })

    this.subscriptions.push(dialogRef.afterClosed().subscribe((result?: { action: string, textFieldValue: string }) => {
      if(result?.action === 'Confirm'){

        this.onConfirm(action, result.textFieldValue);
      }
    }))

  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onEditClick() {

    // Checks if user has edit access on approval grid, received from portfolio mapping as @Input() to approval grid component

    if(this.componentParent.access.editOnApproval){
      this.startEditing();
    }
    else{
      this.dataSvc.setWarningMsg('No edit access', 'Dismiss', 'ark-theme-snackbar-warning');
    }
  }

  startEditing(){
    if(this.componentParent.getSelectedRowID() === null){
      this.componentParent.setSelectedRowID(this.params.node.rowIndex);

    // getRowNode().data returns references to the cell, so update in grid gets reflected here, JSON.parse(JSON.stringify()) just creates the copy of the object data, instead of reference.

      this.originalRowNodeData = JSON.parse(JSON.stringify(this.params.api.getRowNode(this.params.node.id).data));
      this.originalRowNodeID = this.params.node.id;
    }

    if(this.componentParent.getSelectedRowID() !== null && (this.componentParent.getSelectedRowID() !== this.params.node.rowIndex)){

      this.dataSvc.setWarningMsg('Please save the existing entry', 'Dismiss', 'ark-theme-snackbar-warning')   
    }
  }

  onSave(){
    let data = this.params.node.data

    // Check if the mapping is incomplete

    if(!(data.wsoPortfolioID && data.fund && data.fundLegalEntity && data.fundHedging && data.fundStrategy && (data.fundSMA === true || data.fundSMA === false) && 
    data.fundInvestor && data.fundCcy && data.fundAdmin && data.portfolioAUMMethod && data.valuationMethod &&
    (data.isCoinvestment === true || data.isCoinvestment === false) && 
    (data.excludeFxExposure === true || data.excludeFxExposure === false))){
      this.dataSvc.setWarningMsg('Please finish editing the mapping first', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    // Check if mapping has been changed
    
    if(JSON.stringify(data) === JSON.stringify(this.originalRowNodeData)){
      this.dataSvc.setWarningMsg('No change in mapping', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    let m: PortfolioMapping = <PortfolioMapping>{};

    // Since we are editing an exisiting entry in the staging table.
    m.stagingID = data.stagingID;

    m.mappingID = data.mappingID
    m.fund = data.fund
    m.fundLegalEntity = data.fundLegalEntity
    m.fundHedging = data.fundHedging
    m.fundStrategy = data.fundStrategy
    m.fundPipeline2 = data.fundPipeline2
    m.fundSMA = data.fundSMA
    m.fundInvestor = data.fundInvestor
    m.wsoPortfolioID = data.wsoPortfolioID
    m.fundPipeline = data.fundPipeline
    m.fundCcy = data.fundCcy
    m.fundAdmin = data.fundAdmin
    m.portfolioAUMMethod = data.portfolioAUMMethod
    m.valuationMethod = data.valuationMethod
    m.fundRecon = data.fundRecon
    m.legalEntityName = data.legalEntityName
    m.lei = data.lei
    m.isCoinvestment = data.isCoinvestment
    m.excludeFxExposure = data.excludeFxExposure
    m.portfolioName = data.portfolioName
    m.solvencyPortfolioName = data.solvencyPortfolioName
    m.userName = this.dataSvc.getCurrentUserName()

    this.subscriptions.push(this.portfolioManagerSvc.putPortfolioMapping(m).pipe(
    ).subscribe({
      next: resp => {
        if(resp.isSuccess){
          this.dataSvc.setWarningMsg('Sent for approval', 'Dismiss', 'ark-theme-snackbar-success')
          
          //Refresh Approval grid on staging table update
          this.componentParent.fetchPortfolioMappingStaging();
            
          this.componentParent.setSelectedRowID(null);
        }
      },
      error: error => {

        this.dataSvc.setWarningMsg('Sending for approval failed', 'Dismiss', 'ark-theme-snackbar-error')  

        console.error("Sending for approval failed")
        console.error(error)
      }
    }))
  }

  undoEdit(){
    if(this.originalRowNodeID){
      this.params.api?.getRowNode(this.originalRowNodeID)?.setData(this.originalRowNodeData);
      this.originalRowNodeData = this.originalRowNodeID = null;
      this.componentParent.setSelectedRowID(null);

      this.params.api.refreshClientSideRowModel('aggregate')
    }
    else {
      /** In case of Cloned row editing */

      this.componentParent.setSelectedRowID(null)
      this.componentParent.adaptableApi.gridApi.deleteGridData([this.params.node.data])
    }
  }

}
