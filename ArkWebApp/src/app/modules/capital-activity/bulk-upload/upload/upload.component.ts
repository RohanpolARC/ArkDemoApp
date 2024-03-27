import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { NavQuarterlyGridUtilService } from '../../services/nav-quarterly-grid-util.service';
import { ActivitiesGridUtilService} from '../../services/activities-grid-util.service';
import { UploadService } from '../../services/upload.service';
import * as XLSX from 'xlsx';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ConfigurationService } from '../../services/configuration.service';

export type UPLOAD_TEMPLATE = 'NAV Quarterly' | 'Activities';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  providers: [NavQuarterlyGridUtilService, ActivitiesGridUtilService, UploadService]
})
export class UploadComponent implements OnInit, OnDestroy {
 
  gridInfo: {
    isValid: boolean,
    gridData: any[]
  }
  /* The value of this variable is used after this dialog is closed to determine if Investor grid is to be reloaded.*/
  isActionSuccessful: boolean;
  subscriptions: Subscription[] = [];
  constructor(public dialogRef: MatDialogRef<UploadComponent>,
    private navQuarterlySvc: NavQuarterlyGridUtilService, 
    private activitiesSvc: ActivitiesGridUtilService,
    private uploadSvc: UploadService,
    private dataService: DataService,
    private configurationSvc: ConfigurationService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  activitiesTemplateURL: string
  navQuarterlyTemplateURL: string
  URL: string
  hideDropzone: boolean
  selectedTemplate: UPLOAD_TEMPLATE = 'Activities'
  validationMessage$: Observable<string> = this.uploadSvc.validationMessage$
  disableSubmit$: Observable<boolean> = this.uploadSvc.disableSubmit$
  submitBtnClick$: Observable<boolean> = this.uploadSvc.submitBtnClick$
  getSaveState: () => 'PENDING' | 'SUCCESS' | 'FAILURE' = this.uploadSvc.getSaveState.bind(this.uploadSvc)
  preprocessData: (headers: string[], data: any[]) => any[]
  validateExcelRows: (rows: any[], ref: {
    capitalTypes: string[], capitalSubTypes: string[], strategies: string[], refData: any, lockDate?: Date
  } | { fundhedgings: string[], strategies: string[], overrideCurrencies:string[], lockDate: Date }) => {

    isValid: boolean, 
    invalidRows?: {
      row: any, remark: string
    }[]}
  generateGridData: (isValid: boolean, processedData: any[], validationResult: {
    isValid: boolean,
    invalidRows?: { row: any, remark: string }[]
  }) => any[]

  validateHeaders : (actualColumns: string[], fileColumns: string[]) => boolean

  handleTemplateUpload : (templateName: string, allowedHeaders: string[], data: any[], fileheaders: string[]) => boolean
  
  onFileReceived(file: File){
    this.hideDropzone = true;
    this.readFile(file)
  }
  selectedTemplateChange(template: UPLOAD_TEMPLATE){

    this.uploadSvc.selectedTemplate = template;

    if(template === 'Activities'){
      this.URL = this.activitiesTemplateURL
      this.handleTemplateUpload = this.activitiesSvc.handleTemplateUpload
      this.validateHeaders = this.activitiesSvc.validateHeaders
      this.preprocessData = this.activitiesSvc.preprocessData
      this.validateExcelRows = this.activitiesSvc.validateExcelRows
      this.generateGridData = this.activitiesSvc.generateGridData
    }
    else if(template === 'NAV Quarterly'){
      this.URL = this.navQuarterlyTemplateURL
      this.handleTemplateUpload = this.navQuarterlySvc.handleTemplateUpload
      this.validateHeaders = this.navQuarterlySvc.validateHeaders
      this.preprocessData = this.navQuarterlySvc.preprocessData
      this.validateExcelRows = this.navQuarterlySvc.validateExcelRows.bind(this.navQuarterlySvc)
      this.generateGridData = this.navQuarterlySvc.generateGridData
    }
  }
  ngOnInit(): void {

    this.activitiesTemplateURL = '../../../../assets/files/templates/CapitalActivityUploadTemplate.xlsx'; 
    this.navQuarterlyTemplateURL = '../../../../assets/files/templates/NavQuarterlyUploadTemplate.xlsx';
    this.hideDropzone = false;

    this.subscriptions.push(this.uploadSvc.actionSuccessful$.pipe(
      filter((actionSuccessful: boolean) => actionSuccessful)
    ).subscribe((actionSuccessful: boolean) => {
      // Only update this once it becomes successful. Need to filter out since we cleanUpSubjects at component destruction.
      this.isActionSuccessful = actionSuccessful
    }))


    this.selectedTemplateChange(this.selectedTemplate)
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  readFile(file: File){
    if(file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
      this.uploadSvc.updateIsFileValid(false);
      return
    }
    else {
      this.uploadSvc.updateIsFileValid(true);
    }

    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    fileReader.onload = (loadEvent: any) => {

      let binaryData = loadEvent.target.result
      let workbook = XLSX.read(binaryData, { type: 'binary' })

      const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], 
        {
          header: 1,            // sheet_to_aoa.
          raw: false,           // preserves date as string. 
          blankrows: false      // removes intermediate blank rows.
      });

      /*
       header : 0 --> Converts into Objects
       header : 1 --> Converts into Array of Arrays (aoa).

      Reference: 
       https://github.com/SheetJS/sheetjs/issues/1729#issuecomment-582595816

      */

      let headers: string[] = data?.[0] || [];

      let validationResult: {isValid: boolean, invalidRows?: {row: any, remark: string}[]} = undefined

      let boolValidateTemplateUpload : boolean

      if (this.selectedTemplate === 'NAV Quarterly') {
        boolValidateTemplateUpload = this.handleTemplateUpload('NAV Quarterly', this.navQuarterlySvc.allowedHeaders, data, headers);
        if(!boolValidateTemplateUpload)
        {
              return
        }
      } 
      else if (this.selectedTemplate === 'Activities') {
        boolValidateTemplateUpload = this.handleTemplateUpload('Capital Activity', this.activitiesSvc.allowedHeaders, data, headers);
        if(!boolValidateTemplateUpload)
        {
              return
        }
      }    
    
      let processedData = this.preprocessData(headers, data?.slice(1));

      this.uploadSvc.updateLoadedFileData(processedData);


      if(this.selectedTemplate === 'Activities'){
        validationResult = this.validateExcelRows(processedData, {
          capitalTypes: this.data.capitalTypes,
          capitalSubTypes: this.data.capitalSubTypes,
          strategies: this.data.strategies,
          refData: this.data.refData,
          lockDate: this.configurationSvc.config?.lockDate
        });
      }
      else if(this.selectedTemplate === 'NAV Quarterly'){
        validationResult = this.validateExcelRows(processedData, {
          fundhedgings: [...new Set(<string>this.data.refData?.map(r => <string>r?.['fundHedging']))],
          strategies: this.data.strategies,
          overrideCurrencies: [...new Set(<string>this.data.refData?.map(r => <string>r?.['fundCcy']))],
          lockDate: this.configurationSvc.config?.lockDate
        })
      }

      this.uploadSvc.updateIsFileValid(validationResult.isValid)

      this.gridInfo = {
        gridData: this.generateGridData(validationResult.isValid, processedData, validationResult),
        isValid: validationResult.isValid
      }
    }
  }
  closeDialog(){
    this.dialogRef.close();
  }
  onSave(){
    this.uploadSvc.updateSubmitBtnClick(true);
  }
}