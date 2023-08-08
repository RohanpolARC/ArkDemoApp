import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LiquiditySummaryComponent } from '../liquidity-summary.component';
import { LiquiditySummaryUpdateModel } from 'src/app/shared/models/LiquiditySummaryModel';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { LiquiditySummaryService } from 'src/app/core/services/LiquiditySummary/liquidity-summary.service';
import { ICellRendererParams } from '@ag-grid-community/core';
import { SsrsReportPopupComponent } from 'src/app/shared/modules/ssrs-report-viewer/ssrs-report-popup/ssrs-report-popup.component';
import { ReportServerParams, UnfundedAssetsReportParams } from 'src/app/shared/models/ReportParamsModel';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-update-cell-renderer',
  templateUrl: './update-cell-renderer.component.html',
  styleUrls: ['./update-cell-renderer.component.scss']
})
export class UpdateCellRendererComponent implements OnInit, ICellRendererAngularComp {

  subscriptions: Subscription[] = []
  params: ICellRendererParams
  attribute: string;
  groupName: string;
  isManual: boolean = false;
  componentParent: LiquiditySummaryComponent;
  originalRowNodeData;
  originalRowNodeID;

  constructor(
    public dialog: MatDialog,
    private msalUserSvc: MsalUserService,
    private liquiditySummarySvc: LiquiditySummaryService
  ) { }

  agInit(params: ICellRendererParams): void {

    this.params = params;
    this.componentParent = params.context.componentParent;
    this.groupName = params.data?.['attrType'];
    this.isManual = params.data?.['isManual'];
    if(params.node.group){
      this.attribute = '';
    }
    else{
      this.attribute = params.value;
    }
  }

  refresh(params: ICellRendererParams): boolean {
    return true
  }

  onEditClick(){
    // this.startEditing();           // No R/W access check

      // R/W access check

    if(this.componentParent.isWriteAccess){
      this.startEditing();
    }
    else{
      this.componentParent.setWarningMsg('Unauthorized', 'Dismiss', 'ark-theme-snackbar-error')   
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

        this.params.api.startEditingCell({ 
          rowIndex: this.params.node.rowIndex, colKey: this.componentParent.fundHedgings[0]
        });      
    }
    else{
      this.componentParent.setWarningMsg('Please save the existing entry', 'Dismiss', 'ark-theme-snackbar-warning')   
    }
  }

  getAttributeID(level: string, attribute: string): number | null {

    let refData = this.componentParent.refData;
    for(let i:number = 0 ; i < refData?.length; i+=1){
      if(refData[i].level === level && refData[i].attribute === attribute)
        return Number(refData[i].id);
    }
    return null;
  }

  getModel(): LiquiditySummaryUpdateModel{
    let model = <LiquiditySummaryUpdateModel>{} 
    let data = this.params.data;

    model.level = data.attrType
    model.attribute = data.attr
    model.attributeID = this.getAttributeID(model.level, model.attribute);

    let FH_Amt_str: string = '';

    for(let i = 0; i < this.componentParent.fundHedgings.length; i+= 1){
      if(Number(data?.[this.componentParent.fundHedgings[i]]) !== Number(this.originalRowNodeData?.[this.componentParent.fundHedgings[i]]))
        FH_Amt_str += this.componentParent.fundHedgings[i] + '|' + 
        (!!String(data?.[this.componentParent.fundHedgings[i]]) ? String(data?.[this.componentParent.fundHedgings[i]]) : 0) + ',';
    }
    FH_Amt_str = FH_Amt_str.slice(0, -1)    // Remove last comma

    model.fundHedgingAmount = FH_Amt_str;
    model.username = this.msalUserSvc.getUserName();
    return model;
  }

  onSave(){
    this.params.api.stopEditing(true);
    this.params.api.refreshClientSideRowModel('aggregate')

    this.subscriptions.push(this.liquiditySummarySvc.updateLiquiditySummary(this.getModel()).subscribe({
      next: data => {

        if(data.isSuccess){
          this.originalRowNodeData = this.originalRowNodeID = null;
          this.componentParent.setSelectedRowID(null);

          this.params.api.refreshCells({
            force: true,
            columns: this.componentParent.fundHedgings,
            rowNodes: [this.params.api.getRowNode(this.params.node.id)]
          });  
          
          this.componentParent.fetchLiquiditySummary();
          
          this.componentParent.setWarningMsg(`Updated successfully`, 'Dismiss', 'ark-theme-snackbar-success');  
        }
        else if(data.isSuccess === false && data.returnMessage === 'No Update'){
          this.componentParent.setWarningMsg(`No update`, 'Dismiss', 'ark-theme-snackbar-warning');  
        }
      },
      error: error => {
        this.componentParent.setWarningMsg(`Failed to update`, 'Dismiss', 'ark-theme-snackbar-error'); 

      }
    }))

  }

  undoEdit(){

    this.params.api?.getRowNode(this.originalRowNodeID)?.setData(this.originalRowNodeData);
    this.originalRowNodeData = this.originalRowNodeID = null;
    this.componentParent.setSelectedRowID(null);
    this.params.api.refreshCells({
      force: true,
      columns: this.componentParent.fundHedgings,
      rowNodes: [this.params.api.getRowNode(this.params.node.id)]
    });
    this.params.api.refreshClientSideRowModel('aggregate')

  }

  openReport(){
    let fundHedgingString = ''
    this.params.context.componentParent.fundHedgings.forEach(element => {
      fundHedgingString =fundHedgingString+element+','
    });
    let ReportParams:UnfundedAssetsReportParams={
      asOfDate:this.params.context.componentParent.asOfDate,
      fundHedgings:fundHedgingString,
      assetId:this.params.context.componentParent.getAssetId(this.params.data['subAttr']),
    }
    let reportData:ReportServerParams = {
      reportHeader : "Unfunded Assets",
      reportServer: environment.ssrsUrl,
      reportUrl : "Reports/UnfundedAssets",
      parameters : ReportParams
    }
    this.dialog.open(SsrsReportPopupComponent,{ 
      data: reportData,
        width: '95vw',
        height: '95vh',
        maxWidth:'100vw'
      })
  }

  ngOnInit(): void {
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
