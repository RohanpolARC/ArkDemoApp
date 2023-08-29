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

interface ILoadDataFunc {
  (): void
}

@Injectable()
export class UtilService {
  constructor(public dialog: MatDialog,
    private capitalActivitySvc: CapitalActivityService,
    private dataSvc: DataService,
    private compReaderSvc: ComponentReaderService) {
      this.loadRefData()
  }
  investorAdaptableApi: AdaptableApi
  investmentAdaptableApi: AdaptableApi
  capitalTypeOptions: string[] = [];
  capitalSubTypeOptions: string[] = [];
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
      this.dataSvc.getRefDatatable('[ArkUI].[CapitalTypeSubtypeAssociation]')
    ]).pipe(
      take(1),
      retry(2)
    ).subscribe({
      next: (res: any[]) => {

        res?.[0]?.['capitalType'].forEach((capitaltype: string) => { this.capitalTypeOptions.push(capitaltype) } )
        res?.[0]?.['capitalSubType'].forEach((capitalsubtype: string) => { this.capitalSubTypeOptions.push(capitalsubtype) } )

        this.refData = res?.[0]?.['portfolio_Info'];

        let reftable: string = res?.[1];
        if(typeof reftable === 'string')
          this.capitalTypeSubtypeAssociation = JSON.parse(reftable);

      },
      error: (error) => {
        this.dataSvc.setWarningMsg(`Failed to load ref data: ${error}`);
      }
    })
  }

  openDialog(data? , actionType = 'ADD', gridData = null):void{

    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        rowData : data,
        adapTableApi: this.investorAdaptableApi,
        adapTableApiInvstmnt: this.investmentAdaptableApi,
        actionType: actionType,
        capitalTypes: this.capitalTypeOptions,
        capitalSubTypes: this.capitalSubTypeOptions,
        capitalTypeSubtypeAssociation: this.capitalTypeSubtypeAssociation,
        refData: this.refData,
        gridData: gridData
      },
      width: '70vw',
      maxWidth: '2000px',
      maxHeight: '99vh'
    });

    dialogRef.afterClosed().pipe(first()).subscribe((result) => {
      
      if(dialogRef.componentInstance.isActionSuccessful){
        this.loadInvestmentData();
        this.loadInvestorData();  
      }
    })
  }

  openBulkUploadDialog(): void {
    const dialogRef = this.dialog.open(UploadComponent, {
      data: {
        adaptableApiInvestor: this.investorAdaptableApi,
        capitalTypes: this.capitalTypeOptions,
        capitalSubTypes: this.capitalSubTypeOptions,
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

}