import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { PortfolioManagerService } from 'src/app/core/services/PortfolioManager/portfolio-manager.service';
import { PortfolioMappingApproval } from 'src/app/shared/models/PortfolioManagerModel';
import { ApprovalComponent } from '../approval/approval.component';

@Component({
  selector: 'app-approval-action-cell-renderer',
  templateUrl: './approval-action-cell-renderer.component.html',
  styleUrls: ['./approval-action-cell-renderer.component.scss']
})
export class ApprovalActionCellRendererComponent implements ICellRendererAngularComp, OnDestroy{

  subscriptions: Subscription[] = []
  params: ICellRendererParams
  componentParent: ApprovalComponent
  agInit(params: ICellRendererParams): void {
    
    this.params = params;
    this.componentParent = params.context.componentParent;
  }

  refresh(params: ICellRendererParams): boolean {
    return true
  }

  constructor(
    private dataSvc: DataService,
    private portfolioManagerSvc: PortfolioManagerService
  ) { }

  onAction(action: 'approve' | 'reject'): void {

    let model: PortfolioMappingApproval = <PortfolioMappingApproval>{};
    model.actionType = this.params.data['actionType'];
    model.approval = (action === 'approve');
    model.stagingID = Number(this.params.data['stagingID'])
    model.approvedBy = this.dataSvc.getCurrentUserName();

    this.subscriptions.push(this.portfolioManagerSvc.putPortfolioMappingApproval(model).subscribe({
      next: resp => {

        if(resp.isSuccess){

          this.dataSvc.setWarningMsg(`Mapping was ${(action === 'approve') ? 'approved' : 'rejected'}`, `Dismiss`, `ark-theme-snackbar-success`)
          this.params.api.applyTransaction({
            remove: [this.params.data] 
          })
          
          // Refreshing mappings grid
          this.componentParent.refreshMappingsEvent.emit('Refresh');
        }
      },
      error: error => {

        this.dataSvc.setWarningMsg(`Failed to ${action}`, `Dismiss`, `ark-theme-snackbar-error`)
        this.params.api.applyTransaction({
          remove: this.params.data 
        })

      }
    }))
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
