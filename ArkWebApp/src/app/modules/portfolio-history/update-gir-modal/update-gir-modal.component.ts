import { Component, OnInit } from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';

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

  constructor(  public dialogRef: MatDialogRef<UpdateGirModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
   
    this.rowData=data.data

    this.asset=this.rowData.asset
    this.issuer=this.rowData.issuerShortName
    this.fundhedging=this.rowData.fundHedging
    this.fundCcy=this.rowData.fundCcy
    this.goingInRate=this.rowData.fxRateBaseEffective
    this.tradeDate=this.rowData.tradeDate
    this.positionCcy=this.rowData.positionCcy

  }

  ngOnInit(): void {

    console.log(this.data.data)

  }

  doAction(){

    this.action='Update'

    this.rowData.fxRateBaseEffective=this.goingInRate


    this.dialogRef.close({event:this.action,data:this.rowData});
  }

  closeDialog(){

    this.action='Cancel'

    this.dialogRef.close({event:this.action});
  }

}
