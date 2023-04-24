import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsrsReportViewerComponent } from './ssrs-report-viewer.component';
import { ReportViewerModule } from 'ngx-ssrs-reportviewer';


@NgModule({
  declarations: [
    SsrsReportViewerComponent
  ],
  imports: [
    CommonModule,
    ReportViewerModule
  ],
  exports:[
    SsrsReportViewerComponent
  ]
})
export class SsrsReportViewerModule { }
