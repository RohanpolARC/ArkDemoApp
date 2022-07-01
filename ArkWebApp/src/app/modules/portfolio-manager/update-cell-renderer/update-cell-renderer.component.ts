import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs-compat/operator/take';
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
    this.startEditing();           // No R/W access check

      // R/W access check

      // if(this.componentParent.isWriteAccess){
      //   this.startEditing();
      // }
      // else{
      //   this.componentParent.setWarningMsg('Unauthorized', 'Dismiss', 'ark-theme-snackbar-error')   
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
          rowIndex: this.params.node.rowIndex, colKey: this.componentParent.columnDefs[1].field
        });      
    }
    else{
      this.dataSvc.setWarningMsg('Please save the existing entry', 'Dismiss', 'ark-theme-snackbar-warning')   
    }
  }

  onSave(){
    let data = this.params.node.data

    if(!(data.wsoPortfolioID && data.fund && data.fundLegalEntity && data.fundHedging && data.fundStrategy && data.fundSMA && data.fundInvestor && data.fundCcy && data.fundAdmin && data.portfolioAUMMethod && data.isCoinvestment && data.excludeFxExposure)){
      this.dataSvc.setWarningMsg('Please finish editing the mapping first', 'Dismiss', 'ark-theme-snackbar-warning')
      return
    }

    let model: PortfolioMapping = <PortfolioMapping>{};

    model.mappingID = data.mappingID
    model.fund = data.fund
    model.fundLegalEntity = data.fundLegalEntity
    model.fundHedging = data.fundHedging
    model.fundStrategy = data.fundStrategy
    model.fundPipeline2 = data.fundPipeline2
    model.fundSMA = data.fundSMA
    model.fundInvestor = data.fundInvestor
    model.wsoPortfolioID = data.wsoPortfolioID
    model.fundPipeline = data.fundPipeline
    model.fundCcy = data.fundCcy
    model.fundAdmin = data.fundAdmin
    model.portfolioAUMMethod = data.portfolioAUMMethod
    model.fundRecon = data.fundRecon
    model.legalEntityName = data.legalEntityName
    model.lei = data.lei
    model.isCoinvestment = data.isCoinvestment
    model.excludeFxExposure = data.excludeFxExposure
    model.portfolioName = data.portfolioName
    model.solvencyPortfolioName = data.solvencyPortfolioName
    model.userName = this.dataSvc.getCurrentUserName()

    this.subscriptions.push(this.portfolioManagerSvc.putPortfolioMapping(model).pipe(
    ).subscribe({
      next: resp => {
        if(resp.isSuccess){
          this.dataSvc.setWarningMsg('Successfully saved portfolio mapping', 'Dismiss', 'ark-theme-snackbar-success')
          
          data.mappingID = parseInt(resp.data);
          this.componentParent.adapTableApi.gridApi.updateGridData([data]);

          this.componentParent.setSelectedRowID(null);
        }
      },
      error: error => {

        this.dataSvc.setWarningMsg('Failed to save portfolio mapping', 'Dismiss', 'ark-theme-snackbar-error')   

        console.error("Failed to save portfolio Mapping")
        console.error(error)
      }
    }))
  }

  undoEdit(){
    if(this.originalRowNodeID){
      this.params.api?.getRowNode(this.originalRowNodeID)?.setData(this.originalRowNodeData);
      this.originalRowNodeData = this.originalRowNodeID = null;
      this.componentParent.setSelectedRowID(null);
      this.params.api.refreshCells({
        force: true,
        columns: this.componentParent.columnDefs.map(col => col.field),
        rowNodes: [this.params.api.getRowNode(this.params.node.id)]
      });
      this.params.api.recomputeAggregates();  
    }
    else {
      this.componentParent.setSelectedRowID(null)
      this.componentParent.adapTableApi.gridApi.deleteGridData([this.params.node.data])
    }
  }

  cloneRow(){
    if(this.componentParent.getSelectedRowID() === null){
      let nodeData = JSON.parse(JSON.stringify(this.params.node.data));
      nodeData['mappingID'] = null
      nodeData['wsoPortfolioID'] = null
      nodeData['portfolioName'] = null
  
      this.componentParent.adapTableApi.gridApi.addGridData([nodeData])
      // this.params.api.applyTransaction({
      //   add: [nodeData]
      // })
      this.params.api.ensureNodeVisible(nodeData)
  
      this.componentParent.editClonedRow();  
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
