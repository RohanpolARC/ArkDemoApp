import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SsrsReportViewerComponent } from '../ssrs-report-viewer.component';
import { ReportServerParams } from 'src/app/shared/models/ReportParamsModel';

@Component({
  selector: 'app-ssrs-report-popup',
  templateUrl: './ssrs-report-popup.component.html',
  styleUrls: ['./ssrs-report-popup.component.scss']
})
export class SsrsReportPopupComponent implements OnInit {

  params:ReportServerParams
  constructor(
    public dialogRef: MatDialogRef<SsrsReportViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data:ReportServerParams
  ) { }


  ngOnInit(): void {
    this.params = this.data
  }

  onClose(){
    this.dialogRef.close()

  }

}
