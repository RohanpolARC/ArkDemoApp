import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, Subscription, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { FeePresetsService } from 'src/app/core/services/FeePresets/fee-presets.service';
import { formatDate } from 'src/app/shared/functions/formatter';
import { getAmountNumber, getMomentDate } from 'src/app/shared/functions/utilities';
import { FeedataFormComponent } from '../feedata-form/feedata-form.component';
import { InvestmentdataFormComponent } from '../investmentdata-form/investmentdata-form.component';

type ACTION_TYPE = 'ADD' | 'EDIT';

@Component({
  selector: 'app-presets-form',
  templateUrl: './presets-form.component.html',
  styleUrls: ['./presets-form.component.scss']
})
export class PresetsFormComponent implements OnInit, AfterViewInit {

  @ViewChild(InvestmentdataFormComponent) investmentForm!: InvestmentdataFormComponent
  @ViewChild(FeedataFormComponent) feeForm!: FeedataFormComponent

  fundName: string
  isSuccess: boolean = false;
  isFailure: boolean = false;
  updateMsg: string
  subscriptions: Subscription[] = []

  action: ACTION_TYPE = null
  feeData: any = null
  feeInvestment: any = null
  adaptableApi: AdaptableApi

  constructor(
    private feePresetsSvc: FeePresetsService,
    public dialogRef: MatDialogRef<PresetsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      action: ACTION_TYPE,
      fundFee: any,
      fundInvestment: any,
      adaptableApi: AdaptableApi
    },
    private msalUserSvc: MsalUserService
  ) { }
  
  ngAfterViewInit(): void {
    this.fundName = this.feeData?.fundName
  }

  updateFundName(fund: string){
    this.fundName = fund;
  }

  ngOnInit(): void {
    this.action = this.data.action;
    this.feeData = this.data.fundFee;
    this.feeInvestment = this.data.fundInvestment;
    this.adaptableApi = this.data.adaptableApi;
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getAmountFields(){
    let feeData = this.feeForm.form.value;
    return {
      commitment: getAmountNumber(feeData?.['general']?.['commitment']),
      currentCapitalCalled: getAmountNumber(feeData?.['general']?.['currentCapitalCalled']),
      financingCommitment: getAmountNumber(feeData?.['financing']?.['financingCommitment']),
      financingMaxCapitalDeploymentPerMonth: getAmountNumber(feeData?.['financing']?.['financingMaxCapitalDeploymentPerMonth']),
      maxCapitalDeploymentPerMonth: getAmountNumber(feeData?.['capitalDeployment']?.['maxCapitalDeploymentPerMonth']),
      otherExpensesFixed: getAmountNumber(feeData?.['other']?.['otherExpensesFixed'])
    }
  }

  onSubmit(){

    let feeData = this.feeForm.form.value;
    let investmentData = this.investmentForm.form.value;

    feeData = {
      ...feeData?.['general'],
      ...feeData?.['financing'],
      ...feeData?.['financingAdvanced'],
      ...feeData?.['capitalDeployment'],
      ...feeData?.['terms'],
      ...feeData?.['other'],
      ...{
        modifiedBy: this.msalUserSvc.getUserName()
      },
      ...{
        entity: this.fundName
      }, 
      ...this.getAmountFields()
    }

    let dateFields: string[] = ['financingEndDate', 'financingStartDate', 'holdingDate', 'investmentDate', 'startDate', 'financingStage1EndDate', 'financingStage2EndDate', 'modifiedOn', 'createdOn'];
    dateFields.forEach((col) => {
      if(['01/01/1970', '01/01/01','01/01/1', 'NaN/NaN/NaN'].includes(formatDate(feeData[col])))
        feeData[col] = null;
      else {
        feeData[col] = getMomentDate(feeData[col])
        feeData[col] = (feeData[col] === 'Invalid Date') ? null : feeData[col]
      }
    })


    // Transforming boolean Yes/No to true/false for API Call.
    let feeDataModel = { ...feeData }

    feeDataModel['hasCatchup'] = (feeData['hasCatchup'] === 'Yes') 
    feeDataModel['includeMgmtFee'] = (feeData['includeMgmtFee'] === 'Yes') 
    feeDataModel['includeOtherExpense'] = (feeData['includeOtherExpense'] === 'Yes') 
    feeDataModel['isMgmtFeesPaidAtEnd'] = (feeData['isMgmtFeesPaidAtEnd'] === 'Yes') 
    feeDataModel['isPerfFeesPaidAtEnd'] = (feeData['isPerfFeesPaidAtEnd'] === 'Yes') 
    feeDataModel['isQuarterEndMgmtFees'] = (feeData['isQuarterEndMgmtFees'] === 'Yes') 
    feeDataModel['overrideExpected'] = (feeData['overrideExpected'] === 'Yes') 
    feeDataModel['reinvestInterest'] = (feeData['reinvestInterest'] === 'Yes') 
    feeDataModel['useFXHedgingCashflows'] = (feeData['useFXHedgingCashflows'] === 'Yes') 

    investmentData = {
      ...investmentData,
      ...{
        modifiedBy: this.msalUserSvc.getUserName()
      }
    }

    this.subscriptions.push(forkJoin([      
      this.feePresetsSvc.putFundFeeData(feeDataModel),
      this.feePresetsSvc.putFundInvestmentData(investmentData)
    ]).pipe(
      catchError((ex) => throwError(ex))
    ).subscribe({
      next: (result: any) => {

        if(result[0].isSuccess && result[1].isSuccess){
          this.updateMsg = 'Successfully updated fee data and investments';
          this.isSuccess = true
          this.isFailure = false  
  
          feeData = {
            ...feeData,
            modifiedOn: new Date(),
            createdOn: (this.action === 'ADD') ? new Date() : this.feeData.createdOn,
            createdBy: (this.action === 'ADD') ? feeData.modifiedBy : this.feeData.createdBy
          }
          if(this.action === 'ADD')
            this.adaptableApi.gridApi.addGridData([feeData])
          else if(this.action === 'EDIT')
            this.adaptableApi.gridApi.updateGridData([feeData])
        }
        else{
          this.updateMsg = 'Failed to update fee data and investments'
          this.isFailure = true
          this.isSuccess = false
        }
      },
      error: (error) => {
        this.updateMsg = 'Failed to update fee data and investments'        
        this.isFailure = true
        this.isSuccess = false
        console.error(`Failed to put fee and investment data: ${error}`)
      }
    }))
  }

  onCancel(){
    this.dialogRef.close();
  }
}
