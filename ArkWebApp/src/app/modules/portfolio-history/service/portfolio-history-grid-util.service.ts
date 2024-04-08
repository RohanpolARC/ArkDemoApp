import { ICellRendererParams, IRowNode, RowNode } from '@ag-grid-community/core';
import { Injectable } from '@angular/core';
import { ICheckboxControl, IDefaultValue, IShowCheckbox } from 'src/app/shared/modules/aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor.types';
import { ActionColumnContext, AdaptableButton } from '@adaptabletools/adaptable-angular-aggrid';
import { ConfirmPopupComponent } from 'src/app/shared/modules/confirmation/confirm-popup/confirm-popup.component';
import { PortfolioHistoryComponentReaderService } from './portfolio-history-component-reader.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { first } from 'rxjs/operators';
import { AssetGIRModel } from 'src/app/shared/models/AssetGIRModel';
import { PortfolioHistoryService } from 'src/app/core/services/PortfolioHistory/portfolio-history.service';
import { DataService } from 'src/app/core/services/data.service';
import { DetailedView } from 'src/app/shared/models/GeneralModel';
import { DefaultDetailedViewPopupComponent } from 'src/app/shared/modules/detailed-view/default-detailed-view-popup/default-detailed-view-popup.component';
import { getNodes } from '../../capital-activity/utilities/functions';

@Injectable()
export class PortfolioHistoryGridUtilService {

  constructor(
    private portfolioHistoryCompReaderService : PortfolioHistoryComponentReaderService,
    private portfolioHistoryService : PortfolioHistoryService,
    private dataSvc : DataService,
    public dialog : MatDialog
  ) { }


  getIsReviewedCheckboxRendererParams() : ICheckboxControl {
    return {
      defaultVal : this.checkboxDefaultValue,
      disableCheckbox : this.checkboxDisabledValue,
      checkboxChanged : this.onCheckboxValueChange.bind(this),
      showCheckbox : this.showCheckbox
    }
  }

  checkboxDefaultValue: IDefaultValue = (params : ICellRendererParams) => { 
    if(params.node.group){
      let unreviewedGIRCount = params.node.allLeafChildren.filter(childNode => (childNode.data.isReviewed === false && childNode.data.staging_FXRateBase != 0)).length 
      return unreviewedGIRCount > 0 ? false : true
    }
    return params.value 
  }

  checkboxDisabledValue: IDefaultValue = (params : ICellRendererParams) => { 
    if(params.node.group){
      return false
    }
    return (params.data?.['toBeReviewed'] === true ? false : params.value) 
  }
  
  showCheckbox: IShowCheckbox = (params : ICellRendererParams) => { 
    if(params.node.group){
      // return false
      if(this.isGroupValid(getNodes(<RowNode>params.node))){
        let unreviewedGIRCount =  params.node.allLeafChildren.filter(childNode => (childNode.data.isReviewed === false && childNode.data.staging_FXRateBase != 0)).length 
        let toBeReviewedCount = params.node.allLeafChildren.filter(childNode => childNode.data.toBeReviewed === true ).length
        return (unreviewedGIRCount > 0 || toBeReviewedCount > 0) ? true : false
      }else{
        return false
      }
    }
    
    if(
      params.data?.['staging_FXRateBase'] !== 0
    ){
      return true 
    }else{
      return false
    }
  }

  onCheckboxValueChange(params:ICellRendererParams){
    if(params.node.group){
      if(params.getValue()){
        params.node.allLeafChildren.forEach(leafNode => {
          if(leafNode.data?.['staging_FXRateBase'] && !leafNode.data?.['isReviewed']){
            leafNode.data['toBeReviewed'] = params.getValue()
            leafNode.data['isReviewed'] = params.getValue()
          }
        })
      }else{
        params.node.allLeafChildren.forEach(leafNode => {
          if(leafNode.data?.['toBeReviewed']){
            leafNode.data['toBeReviewed'] = params.getValue()
            leafNode.data['isReviewed'] = params.getValue()
          }
        })
      }
    }else{
      params.data['toBeReviewed'] = params.getValue() //this property will be used to filter out required rows.
    }
    params.api.refreshCells({columns:['isReviewed'],force:true})

  }

  isGroupValid(allLeafChildrenData: any[]): boolean{
    if(allLeafChildrenData.length > 0){
      const fundCurrency = allLeafChildrenData[0].fundCcy;
      const positionCurrency = allLeafChildrenData[0].positionCcy;

      for(let i = 1; i < allLeafChildrenData.length; i+= 1){
        if((fundCurrency === allLeafChildrenData[i].fundCcy) && (positionCurrency === allLeafChildrenData[i].positionCcy))
          continue;
        else
          return false;
      }
    }
    return true;
  }

  onClickActionDelete(
    button: AdaptableButton<ActionColumnContext>,
    context: ActionColumnContext
  ) : void {

    let gridOptions = this.portfolioHistoryCompReaderService.getGridOptions()

    let dialogRef = this.dialog.open(ConfirmPopupComponent,{
      data: {
        headerText: ( context.rowNode.data?.isOverride === 'Yes' || context.rowNode.data?.staging_FXRateBase ) ? 'Are you sure to delete this GIR?'  : 'There is no GIR to delete.',
        displayConfirmButton : (context.rowNode.data?.isOverride === 'Yes' || context.rowNode.data?.staging_FXRateBase)
      }});
    
    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if(result.action==='Confirm'){
        this.performDelete({
          data:context.rowNode.data,
          adaptableApi:context.adaptableApi,
          node:context.rowNode
        })
        gridOptions.api?.refreshCells({ force: true, rowNodes: [context.rowNode,...this.getParentNodes(context.rowNode)], columns: [  'modifiedOn', 'modifiedBy','reviewedBy','reviewedOn', 'isOverride', 'isReviewed','girSource', 'girSourceID'] })
      }
    });
  }

  getParentNodes(childNode: IRowNode) : IRowNode[] {
    let parentNodes = []
    let node = childNode
    while(node.parent !== undefined){
      node = node.parent
      parentNodes.push(node)
    }
    return parentNodes
  }

  onClickActionInfo(
    button: AdaptableButton<ActionColumnContext>,
    context: ActionColumnContext
  ){

    this.onInfoClicked(context);

  }

  onInfoClicked(p: ActionColumnContext) {

    let m = <DetailedView>{};
    m.screen = 'GIR Editor';
    m.param1 = p.data?.['fundHedging']; // AsOfDate
    m.param2 =  p.data?.['fundCcy'];
    m.param3 = p.data?.['tradeDate'] //asofdate;
    m.param4 = String(p.data?.['assetId']);
    m.param5 = ' ';
    m.strParam1 = []

    const dialogRef = this.dialog.open(DefaultDetailedViewPopupComponent, {
      data: {
        detailedViewRequest: m,
        noFilterSpace: true,
        grid: 'GIR Editor'
      },
      width: '90vw',
      height: '80vh'
    })
  }

  performDelete(params){
    let updateMsg : string

    let AssetGIR: AssetGIRModel = this.portfolioHistoryService.getModel(params.data)



        this.portfolioHistoryService.deleteAssetGIR(AssetGIR).pipe(first()).subscribe({
          next: message => {

            updateMsg =  "GIR successfully deleted";
            
            params.node.data.isOverride = 'No';
            params.node.data.isReviewed = params.value;
            params.node.data.toBeReviewed = false;


            params.node.data.girSource = null;
            params.node.data.girSourceID = null;
            params.node.data.staging_FXRateBase = 0;

            params.node.data.modifiedBy = ' ';
            params.node.data.modifiedOn = null;
            params.node.data.reviewedBy = ' ';
            params.node.data.reviewedOn = null;
            params?.adaptableApi.gridApi.refreshRowNode(params.node)
            this.dataSvc.setWarningMsg(updateMsg,'dismiss','ark-theme-snackbar-success')

          },
          error: error => {

            updateMsg = "GIR Delete Failed";
            this.dataSvc.setWarningMsg(updateMsg,'dismiss','ark-theme-snackbar-error')

            console.error("Error deleting row." + error);
          }
        });
  
  }

}
