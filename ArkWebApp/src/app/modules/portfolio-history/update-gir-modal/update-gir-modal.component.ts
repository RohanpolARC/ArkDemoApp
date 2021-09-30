import { Component, OnInit } from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import {AssetGIRModel} from '../../../shared/models/AssetGIRModel'
import {DataService} from '../../../core/services/data.service'
import { PortfolioHistoryService } from 'src/app/core/services/PortfolioHistory/portfolio-history.service';


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

  constructor(  public dialogRef: MatDialogRef<UpdateGirModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private dataService:DataService, private portfolioHistoryService:PortfolioHistoryService ) { 
   
    this.rowData=data.data

    this.asset=this.rowData.asset
    this.issuer=this.rowData.issuerShortName
    this.fundhedging=this.rowData.fundHedging
    this.fundCcy=this.rowData.fundCcy
    this.goingInRate=this.rowData.fxRateBaseEffective
    this.tradeDate=new Date(this.rowData.tradeDate).toLocaleDateString('en-GB')
    this.positionCcy=this.rowData.positionCcy

    this.assetGIR=new AssetGIRModel()

  }

  ngOnInit(): void {

    console.log(this.data.data)

    this.currentUserName=this.dataService.getCurrentUserInfo().name

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
