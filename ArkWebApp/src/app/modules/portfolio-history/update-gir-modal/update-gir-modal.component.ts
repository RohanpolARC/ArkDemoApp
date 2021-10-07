import { Component, OnInit } from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import {AssetGIRModel} from '../../../shared/models/AssetGIRModel'
import {DataService} from '../../../core/services/data.service'
import { PortfolioHistoryService } from 'src/app/core/services/PortfolioHistory/portfolio-history.service';
import { RowNode } from '@ag-grid-community/core';

import { ColDef } from '@ag-grid-community/core';

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

  // Ag-grid variables.

  columnDefs: ColDef[] = [
    {headerName:'Issuer', field:'issuerShortName'},
    {headerName:'Asset', field:'asset'},
    {headerName:'Trade Date', field:'tradeDate'},
    {headerName:'Fund Hedging', field:'fundHedging'},
    {headerName:'FXRateBaseEffective', field:'fxRateBaseEffective'},
  ];

  constructor(  public dialogRef: MatDialogRef<UpdateGirModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private dataService:DataService, private portfolioHistoryService:PortfolioHistoryService ) { 

      this.assetGIR=new AssetGIRModel()

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
    console.log(this.allLeafChildrenData);
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

    console.log(this.data.data)

    this.currentUserName=this.dataService.getCurrentUserInfo().name
    this.isGroupSelected = this.data.group;

      /* When no group is selected. */
    if(this.isGroupSelected == false)    
      this.initEditRow();   /* Initialises variable for editing */
    else{
      this.initLeafChildrenData();
      this.isGroupSelectedValid = this.isGroupValid(this.allLeafChildrenData);
      console.log("isGroupValid Result: " + this.isGroupSelectedValid);
      
      // this.bulkRowData = [];
      // for(let i = 0; i < this.allLeafChildrenData.length; i+= 1){
      //   this.bulkRowData.push(this.allLeafChildrenData[i]);
      // }
      // console.log(typeof this.bulkRowData);
      // console.log(this.bulkRowData);
    }

  }

  doAction(){

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
    this.assetGIR.ModifiedOn=new Date()

    
    this.portfolioHistoryService.putAssetGIR(this.assetGIR).subscribe({
          next: data => {     
            this.dialogRef.close({event:this.action,data:this.rowData});
    
          },
          error: error => {
              console.error('There was an error!', error);
          }
    
  })

}

  closeDialog(){

    this.action='Cancel'

    this.dialogRef.close({event:this.action});
  }

}
