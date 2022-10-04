import { Component, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import {AssetGIRModel} from '../../../shared/models/AssetGIRModel'
import {DataService} from '../../../core/services/data.service'
import { PortfolioHistoryService } from 'src/app/core/services/PortfolioHistory/portfolio-history.service';

@Component({
    templateUrl:'./delete-confirm.html',
    styles:[' .success-msg{ color: rgb(8, 204, 90); padding: 5px; }',
  ' .failure-msg{ color: red; padding: 5px;}']
  })
export class DialogDeleteComponent{
    isDeletable:boolean = false;
    
    isSuccess: boolean;
    isFailure: boolean;
    subscriptions: Subscription[] = [];
    updateMsg: string;
  
    constructor(public dialogRef: MatDialogRef<DialogDeleteComponent>, 
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dataService: DataService, 
        private portfolioHistoryService: PortfolioHistoryService) { } 
  
    closeDialog(){
      this.dialogRef.close({message: this.isSuccess ? 'Deleted Successfully' : 'Not Deleted'});
    }
  
    performDelete(confirmation: boolean){
        // `this.data.rowData` holds the data of the selected row.

      if(confirmation){
        let AssetGIR: AssetGIRModel = new AssetGIRModel();
        AssetGIR.WSOAssetid = this.data.rowData.assetId;
        AssetGIR.AsOfDate = this.data.rowData.asOfDate;
        AssetGIR.Ccy = 0;    // ?
        AssetGIR.Rate = this.data.rowData.fxRateBaseEffective;       // Updated GIR.
        AssetGIR.last_update = new Date();
        AssetGIR.CcyName = this.data.rowData.fundCcy;
        AssetGIR.Text = this.data.rowData.asset;
        AssetGIR.CreatedBy = this.dataService.getCurrentUserInfo().name;
        AssetGIR.ModifiedBy = this.dataService.getCurrentUserInfo().name;
        AssetGIR.CreatedOn = new Date(); 
        AssetGIR.ModifiedOn = new Date();
        AssetGIR.TradeDate = this.data.rowData.tradeDate;
        AssetGIR.FundHedging = this.data.rowData.fundHedging;
  
        this.subscriptions.push(
          this.portfolioHistoryService.deleteAssetGIR(AssetGIR).subscribe({
            next: message => {
              this.isSuccess = true;
              this.isFailure = false;
              this.updateMsg = "GIR successfully deleted";
              
              this.data.rowData.isEdited = 'No';
              this.data.rowData.isOverride = 'No';

              this.data.rowData.girSource = null;
              this.data.rowData.girSourceID = null;
              this.data.rowData.fxRateBaseEffective = 0;
              this.data.rowData.modifiedBy = ' ';
              this.data.rowData.modifiedOn = null;
            },
            error: error => {
              this.isFailure = true;
              this.isSuccess = false;
              this.updateMsg = "GIR Delete Failed";
              console.error("Error deleting row." + error);
            }
          }));
      }
    }
  
    ngOnInit(): void{
      this.isDeletable = this.data.rowData.isEdited === 'Yes';  

      this.isSuccess = false;
      this.isFailure = false;
      this.updateMsg = '';
    }
  
    ngOnDestroy(): void{
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
  }
  