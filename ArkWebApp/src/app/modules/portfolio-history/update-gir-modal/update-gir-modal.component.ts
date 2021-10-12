import { Component, OnInit } from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import {AssetGIRModel} from '../../../shared/models/AssetGIRModel'
import {DataService} from '../../../core/services/data.service'
import { PortfolioHistoryService } from 'src/app/core/services/PortfolioHistory/portfolio-history.service';
import { RowNode } from '@ag-grid-community/core';

import { ColDef } from '@ag-grid-community/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';


@Component({
  selector: 'app-update-gir-modal',
  templateUrl: './update-gir-modal.component.html',
  styleUrls: ['./update-gir-modal.component.scss']
})
export class UpdateGirModalComponent implements OnInit {

  action:string;
  rowData:any;
  asset:string;
  issuer:string;
  fundhedging:string;
  fundCcy:string;
  positionCcy:string;
  goingInRate:any;
  tradeDate:string;
  assetGIR: AssetGIRModel;
  currentUserName:string;

  allLeafChildren: any[];   // Rows of a selected group.
  allLeafChildrenData: any[];
  bulkRowData: any[]; // Data for Ag-grid in bulk update modal.

  isGroupSelected: boolean;   // If group is selected.
  isGroupSelectedValid: boolean;  // If selected group is valid.

  updateMsg: string;
  isSuccessMsgAvailable: boolean;
  isFailureMsgAvailable: boolean;
  // Ag-grid variables.

  gridApi;
  gridColumnApi;

  columnDefs: ColDef[] = [
    {headerName:'Issuer Short Name', field:'issuerShortName'},
    {headerName:'Asset', field:'asset'},
    {headerName:'Trade Date', field:'tradeDate', valueFormatter: this.dateFormatter},
    {headerName:'Fund Hedging', field:'fundHedging'},
    // {headerName:'FXRateBaseEffective', field:'fxRateBaseEffective'},
  ];

  constructor(  public dialogRef: MatDialogRef<UpdateGirModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private dataService:DataService, private portfolioHistoryService:PortfolioHistoryService, public updateMsgSnackBar: MatSnackBar ) { 

      this.assetGIR=new AssetGIRModel()

  }

  onGridReady(params){
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
  
  initEditRow(): void{
    this.rowData=this.data.data

    this.asset=this.rowData.asset
    this.issuer=this.rowData.issuerShortName
    this.fundhedging=this.rowData.fundHedging
    this.fundCcy=this.rowData.fundCcy
    this.goingInRate=this.rowData.fxRateBaseEffective
    this.tradeDate=new Date(this.rowData.tradeDate).toLocaleDateString('en-GB')
    this.positionCcy=this.rowData.positionCcy

   

  }

  initLeafChildrenData(): void{
    this.allLeafChildren = this.data.allLeafChildren;
    this.allLeafChildrenData = this.allLeafChildren.map(row => {
      return row.data;
    })
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

    this.isSuccessMsgAvailable = false;
    this.isFailureMsgAvailable = false;

    this.currentUserName=this.dataService.getCurrentUserInfo().name
    this.isGroupSelected = this.data.group;

      /* When no group is selected. */
    if(this.isGroupSelected == false)    
      this.initEditRow();   /* Initialises variable for editing */
    else{

      this.initLeafChildrenData();
      this.isGroupSelectedValid = this.isGroupValid(this.allLeafChildrenData);
      
      if(this.isGroupSelectedValid)
        this.goingInRate = this.allLeafChildrenData[0].fxRateBaseEffective;

    }

  }

  openUpdateMsgSnackBar(message: string, action: string){
    this.updateMsgSnackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "top"
    });
  }

  dateFormatter(params) {
    if(params.value==undefined || params.value=="0001-01-01T00:00:00")
      return ""
    else 
      return moment(params.value).format('DD/MM/YYYY');
  }
  
  doAction(){

    if(this.isGroupSelected && this.isGroupSelectedValid)
    {
      this.action='Update in Bulk';
      let bulkAssetGIR: AssetGIRModel [] = [];
      
      let uniqueAssetsCountMap = new Map();

      for(let i = 0; i < this.allLeafChildrenData.length; i+= 1){
        
        if(uniqueAssetsCountMap.has(this.allLeafChildrenData[i].assetId))
          continue;

        uniqueAssetsCountMap.set(this.allLeafChildrenData[i].assetId, true);

        let bufferAssetGIR: AssetGIRModel = new AssetGIRModel();
        bufferAssetGIR.WSOAssetid = this.allLeafChildrenData[i].assetId;
        bufferAssetGIR.AsOfDate = this.allLeafChildrenData[i].asOfDate;
        bufferAssetGIR.Ccy = 0;    // ?
        bufferAssetGIR.Rate = this.goingInRate;       // Updated GIR.
        bufferAssetGIR.last_update = new Date();
        bufferAssetGIR.CcyName = this.allLeafChildrenData[i].positionCcy;
        bufferAssetGIR.Text = this.allLeafChildrenData[i].asset;
        bufferAssetGIR.CreatedBy = this.currentUserName;
        bufferAssetGIR.ModifiedBy = this.currentUserName;
        bufferAssetGIR.CreatedOn = new Date(); 
        bufferAssetGIR.ModifiedOn = new Date();
        bufferAssetGIR.TradeDate = this.allLeafChildrenData[i].tradeDate;
        bufferAssetGIR.FundHedging = this.allLeafChildrenData[i].fundHedging;

        this.allLeafChildrenData[i].goingInRate = this.goingInRate;

        bulkAssetGIR.push(bufferAssetGIR);
      }


      this.portfolioHistoryService.putBulkAssetGIR(bulkAssetGIR).subscribe({
        next: data => {

          this.isSuccessMsgAvailable = true;
          this.updateMsg = "Updated going in rate for " + this.allLeafChildrenData.length + (this.allLeafChildrenData.length > 1 ? " assets." : " asset.");

          // this.dialogRef.close({event: this.action, data: this.allLeafChildrenData});

          

          for(let i = 0; i < this.allLeafChildren.length; i+= 1){
            // this.data.allLeafChildren[i].data.fxRateBaseEffective = this.goingInRate;

            

            this.data.allLeafChildren[i].setDataValue('fxRateBaseEffective', this.goingInRate);
            this.data.allLeafChildren[i].setDataValue('modifiedOn', new Date());
            this.data.allLeafChildren[i].setDataValue('modifiedBy', this.dataService.getCurrentUserName());
          }
          this.openUpdateMsgSnackBar("Updated going in rate for " + this.allLeafChildrenData.length + (uniqueAssetsCountMap.size > 1 ? " assets" : " asset"), "Dismiss");
        },
        error: error => {
          this.isFailureMsgAvailable = true;
          this.updateMsg = "Update Failed.";
        }
      })
    }
    else{
    this.action='Update'

    this.rowData.fxRateBaseEffective=this.goingInRate

    this.assetGIR.id=0;
    this.assetGIR.WSOAssetid=this.rowData.assetId;
    this.assetGIR.AsOfDate=this.rowData.asOfDate,
    this.assetGIR.Ccy=0,
    this.assetGIR.Rate=this.rowData.fxRateBaseEffective,
    this.assetGIR.last_update=new Date(),
    this.assetGIR.CcyName=this.rowData.positionCcy,
    this.assetGIR.Text=this.rowData.asset,
    this.assetGIR.CreatedBy=this.currentUserName,
    this.assetGIR.ModifiedBy=this.currentUserName,
    this.assetGIR.CreatedOn=new Date(),
    this.assetGIR.ModifiedOn=new Date(),
    this.assetGIR.TradeDate = this.rowData.tradeDate;

    this.assetGIR.FundHedging = this.rowData.fundHedging;

    this.portfolioHistoryService.putAssetGIR(this.assetGIR).subscribe({
          next: data => {     
            
            this.isSuccessMsgAvailable = true;
            this.updateMsg = "Going in rate updated successfully.";

            // this.dialogRef.close({event:this.action,data:this.rowData});
            this.data.setDataValue('fxRateBaseEffective', this.goingInRate);
            this.data.setDataValue('modifiedOn', new Date());
            this.data.setDataValue('modifiedBy', this.dataService.getCurrentUserName());

            
          },
          error: error => {
              console.error('There was an error!', error);
              this.isFailureMsgAvailable = true;
              this.updateMsg = "Update Failed.";
          }
    
      })
    }

}

  closeDialog(){

    this.action='Cancel'

    this.dialogRef.close({event:this.action});
  }

}
