import { Component, OnInit,Input, OnDestroy } from '@angular/core';
import { SSRSReportViewerService } from 'src/app/core/services/SSRSReportViewer/ssrs-report-viewer.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { GeneralFilterService } from 'src/app/core/services/GeneralFilter/general-filter.service';
import { FilterValueChangeParams } from '../../models/FilterPaneModel';
import { ReportServerParams } from '../../models/ReportParamsModel';


@Component({
  selector: 'app-ssrs-report-viewer',
  templateUrl: './ssrs-report-viewer.component.html',
  styleUrls: ['./ssrs-report-viewer.component.scss']
})
export class SsrsReportViewerComponent implements OnInit,OnDestroy {
  @Input() reportServerParams:ReportServerParams
  reportSrc:string
  reportIFrameURL:SafeResourceUrl

  subscriptions:Subscription[] = []

  formatTypes:string[]=['Pdf','Excel','Word','PowerPoint','CSV file','XML file','TIFF file','MHTML']
  formatType:string = 'Pdf'
  displayIFrame: boolean = false;
  header:string 
  reportFilterConfigKey: string;
  customIframeHeight: string = 'height:90%';
  fileName: string;

  constructor(
    private ssrsReportViewerSvc:SSRSReportViewerService,
    private filterSvc:GeneralFilterService,
    protected sanitizer: DomSanitizer
  ) { }
  

  ngOnInit(): void {
    this.reportIFrameURL =  this.sanitizer.bypassSecurityTrustResourceUrl("")
    
    if(this.reportServerParams.reportFilterConfigKey){
      this.reportFilterConfigKey = this.reportServerParams.reportFilterConfigKey
      this.customIframeHeight = 'height:80%'
    }
    this.header = this.reportServerParams.reportHeader
    
    this.setFileName(this.reportServerParams.reportUrl)
    
    let reportSrc = this.ssrsReportViewerSvc.makeReportLink(this.reportServerParams,this.ssrsReportViewerSvc.getSSRSFormatParam(this.formatType),100,true)
    this.getReportFile(reportSrc,'Pdf',true,false)
    this.subscriptions.push(this.filterSvc.currentFilterValues.subscribe((params:FilterValueChangeParams)=>{
      if(params.reportParamName){
        this.reportServerParams.parameters[params.reportParamName]=params.value
      }
    }))

  }

  setFileName(reportUrl):void{
    let urlparts = reportUrl.split("/")
    this.fileName =  urlparts[urlparts.length-1]
    return
  }

  getFileName():string{
    return this.fileName
  }


  getReportFile(src:string,formatType:string,setReportIFrameURL:boolean,isExport:boolean){
    this.ssrsReportViewerSvc.getReport(src,formatType).pipe(first()).subscribe({
      next:(data)=>{
       let objectURL:string= this.ssrsReportViewerSvc.getObjectURL(data)
       if(setReportIFrameURL){
         this.reportIFrameURL = this.sanitizer.bypassSecurityTrustResourceUrl(objectURL)
       }
       if(isExport){
        this.downloadFile(this.getFileName(),objectURL)
       }
      },
      error:(err)=>{
        console.error(err)
      }
    })
  }

  onExport(){
    let formatType = this.ssrsReportViewerSvc.getSSRSFormatParam(this.formatType)
    let exportUrl = this.ssrsReportViewerSvc.makeReportLink(this.reportServerParams,formatType)

    this.getReportFile(exportUrl,formatType,false,true)

  }

  onApply(){
    let reportSrc = this.ssrsReportViewerSvc.makeReportLink(this.reportServerParams,this.ssrsReportViewerSvc.getSSRSFormatParam('Pdf'),100,true)
    this.getReportFile(reportSrc,'Pdf',true,false)
  }

  downloadFile(fileName,objectURL){
    const downloadLink = document.createElement("a");
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.setAttribute("href", objectURL);
    downloadLink.setAttribute("download", fileName);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }


  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }


}
