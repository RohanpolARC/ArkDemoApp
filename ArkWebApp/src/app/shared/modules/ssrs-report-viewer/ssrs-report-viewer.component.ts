import { Component, OnInit,Input } from '@angular/core';
import { ReportServerParams } from '../../models/GeneralModel';


@Component({
  selector: 'app-ssrs-report-viewer',
  templateUrl: './ssrs-report-viewer.component.html',
  styleUrls: ['./ssrs-report-viewer.component.scss']
})
export class SsrsReportViewerComponent implements OnInit {
  @Input() reportServerParams:ReportServerParams

  constructor() { }

  ngOnInit(): void {
    

  }



}
