import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { forkJoin } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { take, retry, first } from 'rxjs/operators';
import { IPropertyReader } from 'src/app/shared/models/GeneralModel';
import { ComponentReaderService } from './component-reader.service';
import { ModalComponent } from '../modal/modal.component';
import { UploadComponent } from '../bulk-upload/upload/upload.component';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { ConfigurationService } from './configuration.service';

interface ILoadDataFunc {
  (): void
}

@Injectable()
export class UtilService {
  constructor(public dialog: MatDialog,
    private capitalActivitySvc: CapitalActivityService,
    private dataSvc: DataService,
    private compReaderSvc: ComponentReaderService,
    private configurationSvc: ConfigurationService
    ) {
      this.loadRefData()
  }
  investorAdaptableApi: AdaptableApi
  investmentAdaptableApi: AdaptableApi
  capitalTypeOptions: string[] = [];
  capitalSubTypeOptions: string[] = [];
  strategyOptions: string[] = [];
  capitalTypeSubtypeAssociation = [];
  refData: any[] = []
  component: IPropertyReader
  registerComponent(comp: IPropertyReader){
    this.component = comp
  }

  init(): void {

    // Causing Errors. Flow order needs to be fixed.

    setTimeout(() => {
      this.investmentAdaptableApi = this.compReaderSvc.investmentAdaptableApi();
      this.investorAdaptableApi = this.compReaderSvc.investorAdaptableApi();  
    }, 500)
  }


  loadInvestorData(){
    let loader = this.component.readProperty<ILoadDataFunc>('loadInvestorData').bind(this.component)
    loader()  }
  loadInvestmentData(){
    let loader = this.component.readProperty<ILoadDataFunc>('loadInvestmentData').bind(this.component)
    loader()
  }
  loadRefData(){

    forkJoin([
      this.capitalActivitySvc.getCapitalRefData(),
      this.dataSvc.getRefDatatable('[ArkUI].[CapitalTypeSubtypeAssociation]'),
      this.capitalActivitySvc.getCapitalActivityConfig(false)
    ]).pipe(
      take(1),
      retry(2)
    ).subscribe({
      next: (res: any[]) => {

        res?.[0]?.['capitalType'].forEach((capitaltype: string) => { this.capitalTypeOptions.push(capitaltype) } )
        res?.[0]?.['capitalSubType'].forEach((capitalsubtype: string) => { this.capitalSubTypeOptions.push(capitalsubtype) } )
        res?.[0]?.['strategy'].forEach((strategy: string) => { this.strategyOptions.push(strategy) } )

        this.refData = res?.[0]?.['portfolio_Info'];

        let reftable: string = res?.[1];
        if(typeof reftable === 'string')
          this.capitalTypeSubtypeAssociation = JSON.parse(reftable);

        this.configurationSvc.updateCapitalActivityConfig(res?.[2]?.[0])
      },
      error: (error) => {
        this.dataSvc.setWarningMsg(`Failed to load ref data: ${error}`);
      }
    })
  }

  openDialog(data? , actionType = 'ADD', gridData = null, isLocked?):void{

    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        rowData : data,
        adapTableApi: this.investorAdaptableApi,
        adapTableApiInvstmnt: this.investmentAdaptableApi,
        actionType: actionType,
        capitalTypes: this.capitalTypeOptions,
        capitalSubTypes: this.capitalSubTypeOptions,
        strategies: this.strategyOptions,
        capitalTypeSubtypeAssociation: this.capitalTypeSubtypeAssociation,
        refData: this.refData,
        gridData: gridData,
        isLocked: isLocked
      },
      width: '70vw',
      maxWidth: '2000px',
      maxHeight: '99vh'
    });

    dialogRef.afterClosed().pipe(first()).subscribe((result) => {
     
      if(actionType === 'ADD' && dialogRef.componentInstance.isActionSuccessful){
        this.loadInvestorData();  
      }

      else if(actionType === 'EDIT' && dialogRef.componentInstance.isActionSuccessful && data.isLinked){
        this.loadInvestorData();  
        this.loadInvestmentData();
      }

      else if(actionType === 'EDIT' && dialogRef.componentInstance.isActionSuccessful && !data.isLinked){
        this.loadInvestorData();  
      }

      else if(actionType === 'LINK-ADD' && dialogRef.componentInstance.isActionSuccessful){
        this.loadInvestorData();  
        this.loadInvestmentData();
      }
    })
  }

  openBulkUploadDialog(): void {
    const dialogRef = this.dialog.open(UploadComponent, {
      data: {
        adaptableApiInvestor: this.investorAdaptableApi,
        capitalTypes: this.capitalTypeOptions,
        capitalSubTypes: this.capitalSubTypeOptions,
        strategies: this.strategyOptions,
        refData: this.refData
      },
      width: '90vw',
      maxWidth: '90vw',
      height: '80vh',
    })
    dialogRef.afterClosed().pipe(first()).subscribe((result) => {
      // Bulk Upload Dialog Closed.
      if(dialogRef.componentInstance.isActionSuccessful){
        this.loadInvestorData();
      }
    })
  }

  updateInvestmentLinking(){
    this.capitalActivitySvc.updateLinkEvent(true);
  }

  openConfigDialog(){
    const dialogRef = this.dialog.open(ConfigurationComponent, {
      width: '55vw',
      maxWidth: '55vw',
      height: '85vh',
      maxHeight: '99vh'
    })
  }


}