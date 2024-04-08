import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { FeePresetsService } from 'src/app/core/services/FeePresets/fee-presets.service';
import { formatDate } from 'src/app/shared/functions/formatter';
import { getAmountNumber, getMomentDate } from 'src/app/shared/functions/utilities';
import { APIReponse } from 'src/app/shared/models/GeneralModel';
import { PresetGridAction } from '../fee-presets.component';
import { FeedataFormComponent } from '../feedata-form/feedata-form.component';
import { InvestmentdataFormComponent } from '../investmentdata-form/investmentdata-form.component';

@Component({
  selector: 'app-presets-form',
  templateUrl: './presets-form.component.html',
  styleUrls: ['./presets-form.component.scss']
})
export class PresetsFormComponent implements OnInit, AfterViewInit {

  @ViewChild(InvestmentdataFormComponent) investmentForm!: InvestmentdataFormComponent
  @ViewChild(FeedataFormComponent) feeForm!: FeedataFormComponent

  presetName: string
  isSuccess: boolean = false;
  isFailure: boolean = false;
  updateMsg: string
  subscriptions: Subscription[] = []

  action: PresetGridAction = null
  feeData: any = null
  feeInvestment: any = null
  adaptableApi: AdaptableApi

  constructor(
    private feePresetsSvc: FeePresetsService,
    public dialogRef: MatDialogRef<PresetsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      action: PresetGridAction,
      presetID?: number,
      fundFee: any,
      fundInvestment: any,
      adaptableApi: AdaptableApi
    },
    private msalUserSvc: MsalUserService
  ) { }
  
  ngAfterViewInit(): void {
    this.presetName = this.feeData?.presetName
  }

  updatePresetName(preset: string){
    this.presetName = preset;
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

    investmentData = {
      ...{ 
        presetID: this.data.presetID
       },
      ...investmentData
    }

    feeData = {
      ...{ 
        presetID: this.data.presetID
       },
      ...feeData?.['general'],
      ...feeData?.['financing'],
      ...feeData?.['financingAdvanced'],
      ...feeData?.['capitalDeployment'],
      ...feeData?.['terms'],
      ...feeData?.['other'],
      ...{
        modifiedBy: this.msalUserSvc.getUserName()
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
    feeDataModel['useGIRAdjustment'] = (feeData['useGIRAdjustment'] === 'Yes')
    feeDataModel['isPerfFeeAfterMgmtFee'] = (feeData['isPerfFeeAfterMgmtFee'] === 'Yes') 

    investmentData = {
      ...investmentData,
      ...{
        modifiedBy: this.msalUserSvc.getUserName()
      }
    }

    this.subscriptions.push(    
      this.feePresetsSvc.putFeePresets({
        feeData: feeDataModel,
        investmentData: investmentData
      })
      .pipe(
        catchError((ex) => throwError(ex))
      ).subscribe({
        next: (result: APIReponse) => {

          if(result.isSuccess){

            this.updateMsg = 'Successfully updated fee data and investments';
            this.isSuccess = true
            this.isFailure = false  

            let presetID: number = result.data;

            feeData = {
              ...feeData,
              ...{ presetID: presetID },
              modifiedOn: new Date(),
              createdOn: (this.action === PresetGridAction.ADD) ? new Date() : this.feeData.createdOn,
              createdBy: (this.action === PresetGridAction.ADD) ? feeData.modifiedBy : this.feeData.createdBy
            }
            if(this.action === PresetGridAction.ADD || this.action === PresetGridAction.CLONE)
              this.adaptableApi.gridApi.addGridData([feeData])
            else if(this.action === PresetGridAction.EDIT)
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
