import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsrsReportViewerComponent } from './ssrs-report-viewer.component';
import { ReportViewerModule } from 'ngx-ssrs-reportviewer';
import { SsrsReportPopupComponent } from './ssrs-report-popup/ssrs-report-popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    SsrsReportViewerComponent,
    SsrsReportPopupComponent
  ],
  imports: [
    CommonModule,
    ReportViewerModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports:[
    SsrsReportViewerComponent,
    SsrsReportPopupComponent

  ]
})
export class SsrsReportViewerModule { }
