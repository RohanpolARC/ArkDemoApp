import { Component,Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NetReturnsService } from 'src/app/core/services/NetReturns/net-returns.service';
import { ReportServerParams } from 'src/app/shared/models/GeneralModel';
import { SsrsReportViewerComponent } from 'src/app/shared/modules/ssrs-report-viewer/ssrs-report-viewer.component';
import { environment } from "src/environments/environment";


@Component({
  selector: 'app-report-wrapper',
  templateUrl: './report-wrapper.component.html',
  styleUrls: ['./report-wrapper.component.scss']
})
export class ReportWrapperComponent implements OnInit {

  reportServer: string
  reportUrl: string 
  showParameters: string
  language: string 
  toolbar: string 
  params:ReportServerParams

  constructor(
    public dialogRef: MatDialogRef<SsrsReportViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      asOfDate:Date,
      fundHedging:string,
      cashflowType:string,
      calculationType:string
    },
    public netReturnsSvc: NetReturnsService

  ) { 

  }

  ngOnInit(): void {


    this.reportServer = environment.ssrsUrl
    this.reportUrl = 'Reports/NetReturns';
    this.showParameters = "false"; 
    this.language = "en-us";
    this.toolbar = "true";
    this.params = {
      reportServer:this.reportServer,
      reportUrl:this.reportUrl,
      toolbar:this.toolbar,
      language:this.language,
      showParameters:this.showParameters,
      parameters:this.data
    }
  }

  onClose(){
    this.dialogRef.close()
  }

}
