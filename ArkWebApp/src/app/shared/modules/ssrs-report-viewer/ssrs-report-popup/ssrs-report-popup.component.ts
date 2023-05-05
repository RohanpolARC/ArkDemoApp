import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SsrsReportViewerComponent } from '../ssrs-report-viewer.component';
import { environment } from 'src/environments/environment';
import { formatDate } from 'src/app/shared/functions/formatter';

@Component({
  selector: 'app-ssrs-report-popup',
  templateUrl: './ssrs-report-popup.component.html',
  styleUrls: ['./ssrs-report-popup.component.scss']
})
export class SsrsReportPopupComponent implements OnInit {

  params:any
  constructor(
    public dialogRef: MatDialogRef<SsrsReportViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{
      reportName:string,
      asOfDate:string,
      fundHedgings:string,
      assetId:number
    }
  ) { }

  reportServer:string
  reportUrl:string
  showParameters:string
  language:string
  toolbar:string

  ngOnInit(): void {
    this.reportServer = environment.ssrsUrl
    this.reportUrl = `Reports/${this.data.reportName}`;
    this.showParameters = "false"; 
    this.language = "en-us";
    this.toolbar = "true";
    this.params = {
      reportServer:this.reportServer,
      reportUrl:this.reportUrl,
      toolbar:this.toolbar,
      language:this.language,
      showParameters:this.showParameters,
      parameters:{
        asOfDate:this.data.asOfDate,
        assetId:this.data.assetId,
        fundHedgings:this.data.fundHedgings//"CS1FEUR,CS1FUSD,DL01,DL01CoA,DL01CoB,DL02EUR,Dl02USD,DL1,DL3FCAD,DL3FEUR,DL3FGBP,DL3FJPY,DL3FLEVEUR,DL3FLEVUSD,DL3FUSD,DL410EUR,DL410GBP,DL410USD,DL47EUR,DL47GBP,DL47JPY,DL47USD,DL4LEV10EUR,DL4LEV7EUR,DL4LEV7GBP,DL4LEV7USD,DL4LEVS7EUR,DL4LEVS7USD,DL4S10EUR,DL4S7EUR,DL4S7GBP,DL4S7USD,DLHSBC,DLUK,SL2FEUR,SL2FGBP,SL2FJPY,SL2FLEVGBP,SL2FLEVUSD,SL2FUSD,SL2MST,SLF A,SLF B,SLF C,SLF D,SLF K,SLHSBC,SMA A,SMA CALS,SMA CDPQ,SMA FRES,SMA G,SMA G2,SMA GENERALI,SMA HAIL HSBC,SMA Kemp,SMA L,SMA NST,SMA OHIO,SMA PRI,SMA Q"
      }
    }
  }

  onClose(){
    this.dialogRef.close()

  }

}
