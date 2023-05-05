import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SsrsReportViewerComponent } from '../ssrs-report-viewer.component';
import { environment } from 'src/environments/environment';

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
      ReportParams:any
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
      parameters:this.data.ReportParams
    }
  }

  onClose(){
    this.dialogRef.close()

  }

}
