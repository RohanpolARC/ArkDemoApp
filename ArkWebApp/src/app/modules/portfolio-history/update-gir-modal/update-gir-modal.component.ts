import { Component, OnInit } from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import {AssetGIRModel} from '../../../shared/models/AssetGIRModel'
import {DataService} from '../../../core/services/data.service'
import { PortfolioHistoryService } from 'src/app/core/services/PortfolioHistory/portfolio-history.service';
import { ColDef, GridApi, RowNode } from '@ag-grid-community/core';
import { Subscription } from 'rxjs';
import { dateFormatter } from 'src/app/shared/functions/formatter';
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { getNodes } from '../../capital-activity/utilities/functions';


@Component({
  selector: 'app-update-gir-modal',
  templateUrl: './update-gir-modal.component.html',
  styleUrls: ['./update-gir-modal.component.scss']
})
export class UpdateGirModalComponent implements OnInit {

  subscriptions: Subscription[] = [];

  action: string;
  rowData: any;
  asset: string;
  issuer: string;
  fundhedging: string;
  fundCcy: string;
  positionCcy: string;
  goingInRate: any;
  tradeDate: string;
  assetGIR: AssetGIRModel;
  currentUserName: string;

  allLeafChildrenData: any[];
  bulkRowData: any[]; // Data for Ag-grid in bulk update modal.

  isGroupSelected: boolean;   // If group is selected.
  isGroupSelectedValid: boolean;  // If selected group is valid.

  updateMsg: string;
  isSuccess: boolean;
  isFailure: boolean;

  gridData: any; // To hold data for pop up modal grid display. 
  // Ag-grid variables.

  isEditAllowed: boolean;
  isUpdateAllowed: boolean;

  gridApi;
  gridColumnApi;

  columnDefs: ColDef[] = [
    {headerName:'Issuer Short Name', field:'issuerShortName', tooltipField: 'issuerShortName'},
    {headerName:'Asset', field:'asset', tooltipField: 'asset'},
    {headerName:'Trade Date', field:'tradeDate', valueFormatter: dateFormatter, tooltipField: 'tradeDate'},
    {headerName:'Type', field:'typeDesc', tooltipField: 'typeDesc'},
    {headerName:'Position Ccy', field:'positionCcy', tooltipField: 'positionCcy'},
    {headerName:'Fund Ccy', field:'fundCcy', tooltipField: 'fundCcy'},
    {headerName:'Fund Hedging', field:'fundHedging', tooltipField: 'fundHedging'}
  ];

  constructor(  public dialogRef: MatDialogRef<UpdateGirModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      node: RowNode,
      adaptableApi: AdaptableApi,
      gridApi: GridApi
    },private dataService:DataService, private portfolioHistoryService:PortfolioHistoryService ) { 

      this.assetGIR=new AssetGIRModel()

  }

  onGridReady(params){
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
  
  initEditRow(): void{
    this.rowData=this.data.node.data

    this.asset=this.rowData.asset
    this.issuer=this.rowData.issuerShortName
    this.fundhedging=this.rowData.fundHedging
    this.fundCcy=this.rowData.fundCcy
    if(this.rowData.staging_FXRateBase == 0){
      this.goingInRate = this.rowData.pgh_FXRateBaseEffective
    }else{
      this.goingInRate = this.rowData.staging_FXRateBase
    }
    this.tradeDate=new Date(this.rowData.tradeDate).toLocaleDateString('en-GB')
    this.positionCcy=this.rowData.positionCcy

    this.allLeafChildrenData = [this.rowData];
  }

  initLeafChildrenData(): void{
    
    this.allLeafChildrenData = getNodes(this.data.node)
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

  ngOnInit(): void {

    this.isEditAllowed = false;
    this.isUpdateAllowed = false;

    this.isSuccess = false;
    this.isFailure = false;

    this.currentUserName=this.dataService.getCurrentUserInfo().name
    this.isGroupSelected = this.data.node.group;

      /* When no group is selected. */
    if(this.isGroupSelected == false){
      this.initEditRow();   /* Initialises variable for editing */      
    }  
      
    else{

      this.initLeafChildrenData();
      this.isGroupSelectedValid = this.isGroupValid(this.allLeafChildrenData);
      
      if(this.isGroupSelectedValid){
        if(this.allLeafChildrenData[0].staging_FXRateBase == 0){
          this.goingInRate = this.allLeafChildrenData[0].pgh_FXRateBaseEffective
        }else{
          this.goingInRate = this.allLeafChildrenData[0].staging_FXRateBase
        }
      }

    }
    if(this.allLeafChildrenData[0].fundCcy !== this.allLeafChildrenData[0].positionCcy)
        this.isEditAllowed = true;
    else this.isEditAllowed = false;

    this.isUpdateAllowed = this.isEditAllowed;
       
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  
  doAction(){

    this.isUpdateAllowed = false;
    this.isEditAllowed = false;
    
    if(this.isGroupSelected && this.isGroupSelectedValid)
    {
      this.action='Update in Bulk';
      let bulkAssetGIR: AssetGIRModel [] = [];
      
      for(let i = 0; i < this.allLeafChildrenData.length; i+= 1){
        
        let model: AssetGIRModel = new AssetGIRModel();
        model.WSOAssetid = this.allLeafChildrenData[i].assetId;
        model.AsOfDate = this.allLeafChildrenData[i].asOfDate;
        model.Ccy = 0;    // ?
        model.Rate = this.goingInRate;       // Updated GIR.
        model.fxRateOverride = true          // GIR is always overriden if update happens from GIREditor.
        model.last_update = new Date();
        model.CcyName = this.allLeafChildrenData[i].fundCcy;
        model.Text = this.allLeafChildrenData[i].asset;
        model.CreatedBy = this.currentUserName;
        model.ModifiedBy = this.currentUserName;
        model.CreatedOn = new Date(); 
        model.ModifiedOn = new Date();
        model.TradeDate = this.allLeafChildrenData[i].tradeDate;
        model.FundHedging = this.allLeafChildrenData[i].fundHedging;
        model.isReviewed = false;    
        model.ReviewedBy = null;
        model.ReviewedOn =    null; 

        this.allLeafChildrenData[i].goingInRate = this.goingInRate;

        bulkAssetGIR.push(model);
      }
      
      this.subscriptions.push(this.portfolioHistoryService.putAssetGIRReview(bulkAssetGIR).subscribe({
        next: data => {

          this.isSuccess = true;
          this.isFailure = false;
          this.updateMsg = "Updated going in rate for " + this.allLeafChildrenData.length + " assets"

          let updatedData = this.allLeafChildrenData.map(nodeData => {
            nodeData['staging_FXRateBase'] = this.goingInRate,
            nodeData['modifiedOn'] = new Date();
            nodeData['modifiedBy'] = this.currentUserName;
            nodeData['isOverride'] = (nodeData['isReviewed'] === true) ? 'Yes' : 'No',
            
            nodeData['reviewedOn']= null,
            nodeData['reviewedBy']= null,
            nodeData['isReviewed'] = false


            return nodeData
          })
          this.data.gridApi.applyTransaction({
            update: updatedData
          }) 
        },
        error: error => {
          this.isFailure = true;
          this.isSuccess = false;
          this.updateMsg = "Update Failed.";
        }
      }));
    }
    else{
    this.action='Update'

    this.rowData.staging_FXRateBase=this.goingInRate

    this.assetGIR.id = 0;
    this.assetGIR.WSOAssetid = this.rowData.assetId;
    this.assetGIR.AsOfDate = this.rowData.asOfDate;
    this.assetGIR.Ccy = 0;
    this.assetGIR.Rate = this.rowData.staging_FXRateBase;
    this.assetGIR.fxRateOverride = true;            // GIR is always overriden if update happens from GIREditor.
    
    this.assetGIR.isReviewed = false;    
    this.assetGIR.ReviewedBy = null;
    this.assetGIR.ReviewedOn =    null; 

    this.assetGIR.last_update = new Date();
    this.assetGIR.CcyName = this.rowData.fundCcy;   // Changed from positionCcy based on request.
    this.assetGIR.Text = this.rowData.asset;
    this.assetGIR.CreatedBy = this.currentUserName;
    this.assetGIR.ModifiedBy = this.currentUserName;
    this.assetGIR.CreatedOn = new Date();
    this.assetGIR.ModifiedOn = new Date();
    this.assetGIR.TradeDate   = this.rowData.tradeDate;

    this.assetGIR.FundHedging = this.rowData.fundHedging;

    this.subscriptions.push(this.portfolioHistoryService.putAssetGIRReview([this.assetGIR]).subscribe({
          next: data => {     
            
            this.isSuccess = true;
            this.isFailure = false;            
            this.updateMsg = "Going in rate updated successfully.";

            let updatedData = [{...this.data.node.data, ...{
              'staging_FXRateBase': this.goingInRate,
              'modifiedOn': new Date(),
              'modifiedBy': this.currentUserName,
              'reviewedOn': null,
              'reviewedBy': null,
              'isOverride' : (this.data.node.data['isReviewed'] === true) ? 'Yes' : 'No',

              'isReviewed': false
            }}]

            this.data.gridApi.applyTransaction({
              update: updatedData
            }) 
          },
          error: error => {
              console.error('There was an error!', error);
              this.isFailure = true;
              this.isSuccess = false;
              this.updateMsg = "Update Failed.";
          }
    
      }));
    }

}

  closeDialog(){

    this.action='Close';
    this.dialogRef.close({event:this.action});
  }

}
