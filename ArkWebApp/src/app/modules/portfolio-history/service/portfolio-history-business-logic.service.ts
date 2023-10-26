import { Injectable } from '@angular/core';
import { AssetGIRModel } from 'src/app/shared/models/AssetGIRModel';
import { PortfolioHistoryComponentReaderService } from './portfolio-history-component-reader.service';
import { PortfolioHistoryService } from 'src/app/core/services/PortfolioHistory/portfolio-history.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPopupComponent } from 'src/app/shared/modules/confirmation/confirm-popup/confirm-popup.component';
import { first } from 'rxjs/operators';
import { RowNode } from '@ag-grid-community/core';
import { DataService } from 'src/app/core/services/data.service';

@Injectable()
export class PortfolioHistoryBusinessLogicService {
  
  updateMsg: string;

  constructor(
    private dataSvc: DataService,
    private compReaderSvc : PortfolioHistoryComponentReaderService,
    private portfolioHistoryService : PortfolioHistoryService,
    private dialog : MatDialog
  ) { }

  pushReviewed(){
    let toBeReviewedGIRList:AssetGIRModel[] = []
    this.compReaderSvc.getGridOptions().api.forEachNode(node => {
      if(node.data?.['toBeReviewed'] === true){
        let m = this.portfolioHistoryService.getModel(node.data)
        m.fxRateOverride = true
        toBeReviewedGIRList.push(m)
      }
    })
    const confirmDialogRef = this.dialog.open(ConfirmPopupComponent, {
      data:{
        headerText: toBeReviewedGIRList.length ? `Are you sure you want to mark selected going in rates as Reviewed?` : 'No rows are selected to be reviewed',
        displayConfirmButton: toBeReviewedGIRList.length ? true : false
      },
    })

    confirmDialogRef
    .afterClosed()
    .pipe(first())
    .subscribe((val)=>{
      if( val?.['action'] === 'Confirm' ){
        this.setReviewCheckbox(toBeReviewedGIRList)
      }
    })
  }

  setReviewCheckbox(models:AssetGIRModel[]){

    this.portfolioHistoryService.putAssetGIR(models)
    .pipe(first())
    .subscribe({
      next:(respObject)=>{
        if(respObject.isSuccess){
  
          console.log(respObject)
          models.forEach((model) => {
            this.updateReviewColumns()
          })
          
          let updateMsg = "GIR review status updated";
          this.dataSvc.setWarningMsg(updateMsg,'dismiss','ark-theme-snackbar-success')
        }
      },
      error:(err)=>{
        console.error(err)
        let updateMsg = "failed to updated the review status";
        this.dataSvc.setWarningMsg(updateMsg,'dismiss','ark-theme-snackbar-error')
      }
    })
  
  }

  updateReviewColumns(){
    let gridApi = this.compReaderSvc.getGridOptions().api
    let reviewedRowNodes:RowNode[] = []
    gridApi.forEachNode((node) => {
      if(node.data?.['toBeReviewed'] === true){
        reviewedRowNodes.push(<RowNode>node)
        node.data['reviewedBy'] = this.dataSvc.getCurrentUserName()
        node.data['reviewedOn'] = new Date()
        node.data['colour'] = ' '
        node.data['toBeReviewed'] = false
        node.data['girSource'] = 'Manual-Override'
        node.data['isOverride'] = 'Yes'
      }
    })

    gridApi.refreshCells({ force: true, rowNodes: reviewedRowNodes, columns: ['reviewedBy','reviewedOn','isReviewed','colour','girSource','isOverride'] })

    this.compReaderSvc.getAdaptableApi().gridApi.refreshRowNodes(reviewedRowNodes)
    
  }

}
