import { Component, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import {AssetGIRModel} from '../../../shared/models/AssetGIRModel'
import {DataService} from '../../../core/services/data.service'
import { PortfolioHistoryService } from 'src/app/core/services/PortfolioHistory/portfolio-history.service';
import { AdaptableApi } from '@adaptabletools/adaptable/types';

@Component({
    templateUrl:'./delete-confirm.html',
    styles:[' .success-msg{ color: rgb(8, 204, 90); padding: 5px; }',
  ' .failure-msg{ color: red; padding: 5px;}']
  })
export class DialogDeleteComponent{
    isDeletable:boolean = false;
    
    isSuccessMsgAvailable:boolean;
    isFailureMsgAvailable:boolean;
    subscriptions: Subscription[] = [];
    updateMsg: string;
  
    constructor(public dialogRef: MatDialogRef<DialogDeleteComponent>, 
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dataService: DataService, 
        private portfolioHistoryService: PortfolioHistoryService) { } 
  
    closeDialog(){
      this.dialogRef.close({message: this.isSuccessMsgAvailable ? 'Deleted Successfully' : 'Not Deleted'});
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
        AssetGIR.CcyName = this.data.rowData.positionCcy;
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
              this.isSuccessMsgAvailable = true;
              this.isFailureMsgAvailable = false;
              this.updateMsg = "GIR successfully deleted";
              
              this.data.rowData.isEdited = false;

              this.data.rowData.fxRateBaseEffective = ' ';
              this.data.rowData.modifiedBy = ' ';
              this.data.rowData.modifiedOn = null;
            
              /* Uncomment this to actually delete the row from the grid */

            //   this.data.adapTableApi.gridApi.deleteGridData([this.data.rowData]);

            },
            error: error => {
              this.isFailureMsgAvailable = true;
              this.isSuccessMsgAvailable = false;
              this.updateMsg = "GIR Delete Failed";
              console.error("Error deleting row.");
            }
          }));
      }
    }
  
    ngOnInit(): void{
      this.isDeletable = this.data.rowData.isEdited;  

      this.isSuccessMsgAvailable = false;
      this.isFailureMsgAvailable = false;
      this.updateMsg = '';
    }
  
    ngOnDestroy(): void{
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
  }
  