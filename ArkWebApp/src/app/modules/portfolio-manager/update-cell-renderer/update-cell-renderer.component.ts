import { ICellRendererParams, RowNode } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { PortfolioManagerService } from 'src/app/core/services/PortfolioManager/portfolio-manager.service';
import { PortfolioMapping } from 'src/app/shared/models/PortfolioManagerModel';
import { PortfolioManagerComponent } from '../portfolio-manager.component';

@Component({
  selector: 'app-update-cell-renderer',
  templateUrl: './update-cell-renderer.component.html',
  styleUrls: ['./update-cell-renderer.component.scss']
})
export class UpdateCellRendererComponent implements OnInit, ICellRendererAngularComp {

  params: ICellRendererParams
  componentParent: PortfolioManagerComponent
  originalRowNodeData: any;
  originalRowNodeID: string;
  subscriptions: Subscription[] = []
  
  constructor(
    private dataSvc: DataService,
    private portfolioManagerSvc: PortfolioManagerService
  ) { }

  agInit(params: ICellRendererParams): void {

    this.params = params;
    this.componentParent = params.context.componentParent;
  }

  refresh(params: ICellRendererParams): boolean {
    return true;  
  }

  onEditClick() {
    this.startEditing();
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


    // Checks if row being saved is a new/cloned row.
    if(this.componentParent.maxMappingID + 1 === data?.['mappingID']){
      data['mappingID'] = null;
    }

    if(!(data.wsoPortfolioID && data.fund && data.fundLegalEntity && data.fundHedging && data.fundStrategy && (data.fundSMA === true || data.fundSMA === false) && 
    data.fundInvestor && data.fundCcy && data.fundAdmin && data.portfolioAUMMethod && data.valuationMethod && data.portfolioType &&
    (data.isCoinvestment === true || data.isCoinvestment === false) && 
    (data.excludeFxExposure === true || data.excludeFxExposure === false))){
      this.dataSvc.setWarningMsg('Please finish editing the mapping first', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    if(JSON.stringify(data) === JSON.stringify(this.originalRowNodeData)){
      this.dataSvc.setWarningMsg('No change in mapping', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }
    let m: PortfolioMapping = <PortfolioMapping>{};

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
    m.portfolioType = data.portfolioType
    m.portfolioName = data.portfolioName
    m.solvencyPortfolioName = data.solvencyPortfolioName
    m.userName = this.dataSvc.getCurrentUserName()
    
    this.subscriptions.push(this.portfolioManagerSvc.putPortfolioMapping(m).pipe(
    ).subscribe({
      next: resp => {
        if(resp.isSuccess){
          this.dataSvc.setWarningMsg('Sent for approval', 'Dismiss', 'ark-theme-snackbar-success')
          
          // Remove new temp row if cloning, else undo edited to row to previous state, to only show approved mappings in the below grid.

          if(!data.mappingID)
            this.componentParent.adapTableApi.gridApi.deleteGridData([data]);
          else
            this.undoEdit();

          //Refresh Approval grid on staging table update
          this.componentParent.refreshApprovalGrid()
            
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

      this.params.api.refreshClientSideRowModel('everything');  
    }
    else {
      /** In case of Cloned row editing */

      this.componentParent.setSelectedRowID(null)
      this.componentParent.adapTableApi.gridApi.deleteGridData([this.params.node.data])
    }
  }

  cloneRow(){

    if(this.componentParent.getSelectedRowID() === null){

      let newRowID: number = this.componentParent.maxMappingID + 1;

      let nodeData = JSON.parse(JSON.stringify(this.params.node.data));
      nodeData['mappingID'] = newRowID;
      nodeData['wsoPortfolioID'] = null
      nodeData['portfolioName'] = null
      nodeData['modifiedOn'] = null;
      nodeData['modifiedBy'] = null;
  
      this.componentParent.adapTableApi.gridApi.addGridData([nodeData])
      this.params.api.ensureNodeVisible(nodeData)
  
      let node: RowNode = <RowNode>this.componentParent.adapTableApi.gridApi.getRowNodeForPrimaryKey(newRowID)
      this.componentParent.setSelectedRowID(node.rowIndex)
    }
    else{
      this.dataSvc.setWarningMsg('Please save the existing entry', 'Dismiss', 'ark-theme-snackbar-warning')   
    }

  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
