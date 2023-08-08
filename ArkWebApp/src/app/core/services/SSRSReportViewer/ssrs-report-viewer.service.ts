import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APIConfig } from 'src/app/configs/api-config';
import { ReportServerParams } from 'src/app/shared/models/ReportParamsModel';


@Injectable({
  providedIn: 'root'
})
export class SSRSReportViewerService {


  constructor(
    private http:HttpClient
  ) { }

  getReport(reportUrl,formatType){
    return this.http.get(
        `${APIConfig.GET_REPORT_API}`,
        {
            params: {
                'reportUrl': reportUrl,
                'formatType':formatType
            },
            observe:'body',
            responseType:'blob'
        }
    ).pipe(
        catchError((ex) => throwError(ex))
    );
  }

  getObjectURL(data:Blob){
    let blob = new Blob([data], {type: data?.type})
    return URL.createObjectURL(blob)
  }

  makeReportLink(reportServerParams:ReportServerParams, formatType,zoom = 100,onFirstLoad =false){
        let reportPath = reportServerParams.reportUrl
        let reportParams = reportServerParams.parameters
        const reportViewerUrl = reportServerParams.reportServer;
        let reportParamDefaults = {
            'rs:Embed': 'true',
            'rc:Parameters' : 'false',
            'rs:ParameterLanguage':'en-us',
            'rc:Toolbar':'false',
            'rc:Zoom': zoom, 
        };
        if(onFirstLoad){
        reportParamDefaults['rs:Command'] = 'Render'
        reportParamDefaults['rs:Format'] = 'Pdf'
        }else{
        reportParamDefaults['rs:Command'] = 'Render'
        reportParamDefaults['rs:Format'] = formatType
        }
        let reportSP = new URLSearchParams({...reportParamDefaults, ...reportParams});

        return `${reportViewerUrl}?/${reportPath}&${reportSP.toString()}`;
  }



  getSSRSFormatParam(formatType:string){
    if(formatType === 'Excel'){
      return 'EXCELOPENXML'
    }else if(formatType === 'Word'){
      return 'WORDOPENXML'
    }else if(formatType === 'CSV file'){
      return 'CSV'
    }else if(formatType === 'PowerPoint'){
      return 'PPTX'
    }else if(formatType === 'XML file'){
      return 'XML'
    }else if(formatType === 'TIFF file'){
      return 'IMAGE'
    }else if(formatType === 'MHTML'){
      return 'MHTML'
    }else{
      return 'PDF'
    }
  }

}
