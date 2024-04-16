import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsrsReportViewerComponent } from './ssrs-report-viewer.component';
import { SsrsReportPopupComponent } from './ssrs-report-popup/ssrs-report-popup.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GeneralFilterModule } from '../general-filter/general-filter.module';


@NgModule({
  declarations: [
    SsrsReportViewerComponent,
    SsrsReportPopupComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralFilterModule
  ],
  exports:[
    SsrsReportViewerComponent,
    SsrsReportPopupComponent
  ]
})
export class SsrsReportViewerModule { }
