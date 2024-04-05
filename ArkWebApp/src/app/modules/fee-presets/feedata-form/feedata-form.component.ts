import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PresetGridAction } from '../fee-presets.component';

@Component({
  selector: 'app-feedata-form',
  templateUrl: './feedata-form.component.html',
  styleUrls: ['./feedata-form.component.scss']
})
export class FeedataFormComponent implements OnInit {

  @Input() feeData;
  @Input() action: PresetGridAction = PresetGridAction.ADD;

  @Output() presetNameEmitter = new EventEmitter<string>();

  subscriptions: Subscription[] = []
  form: UntypedFormGroup
  stepperError: string = 'Incomplete'
  constructor() { }

  ngOnChanges(changes: SimpleChanges){
    if(!this.form){
      this.initForm();
    }

    if(changes?.feeData?.currentValue && (this.action === PresetGridAction.EDIT || this.action === PresetGridAction.CLONE)){

      (<UntypedFormGroup>this.form.controls['general']).patchValue({
        commitment: this.feeData.commitment,
        currentCapitalCalled: this.feeData.currentCapitalCalled,
        presetName: this.feeData.presetName,
        startDate: this.feeData.startDate,
        curveCurrency: this.feeData.curveCurrency,
        curveName: this.feeData.curveName,
        entity: this.feeData.entity
      });

      (<UntypedFormGroup>this.form.controls['financing']).patchValue({
        financingCommitment: this.feeData.financingCommitment,
        financingEndDate: this.feeData.financingEndDate,
        financingMaxCapitalDeploymentPerMonth: this.feeData.financingMaxCapitalDeploymentPerMonth,
        financingStartDate: this.feeData.financingStartDate
      });

      (<UntypedFormGroup>this.form.controls['financingAdvanced']).patchValue({
        financingStage1Ratio: this.feeData.financingStage1Ratio,
        financingStage2Ratio: this.feeData.financingStage2Ratio,
        financingStage3Ratio: this.feeData.financingStage3Ratio,
        financingStage1EndDate: this.feeData.financingStage1EndDate,
        financingStage2EndDate: this.feeData.financingStage2EndDate
      });
      
      (<UntypedFormGroup>this.form.controls['capitalDeployment']).patchValue({
        holdback: this.feeData.holdback,
        holdingDate: this.feeData.holdingDate,
        maxCapitalDeploymentPerMonth: this.feeData.maxCapitalDeploymentPerMonth,
        reinvestInterest: this.feeData.reinvestInterest
      });

      (<UntypedFormGroup>this.form.controls['terms']).patchValue({
        catchupRate: this.feeData.catchupRate,
        hasCatchup: this.feeData.hasCatchup,
        hurdleCompoundingYears: this.feeData.hurdleCompoundingYears,
        hurdleRate: this.feeData.hurdleRate,
        includeMgmtFee: this.feeData.includeMgmtFee,
        includeOtherExpense: this.feeData.includeOtherExpense,
        investmentDate: this.feeData.investmentDate,
        isMgmtFeesPaidAtEnd: this.feeData.isMgmtFeesPaidAtEnd,
        isPerfFeesPaidAtEnd: this.feeData.isPerfFeesPaidAtEnd,
        isQuarterEndMgmtFees: this.feeData.isQuarterEndMgmtFees,
        mgmtFeesRate: this.feeData.mgmtFeesRate,
        otherExpenseRate: this.feeData.otherExpenseRate,
        perfFeesRate: this.feeData.perfFeesRate,
        undrawnCommitFeesRate: this.feeData.undrawnCommitFeesRate,
        useGIRAdjustment: this.feeData.useGIRAdjustment,
        isPerfFeeAfterMgmtFee: this.feeData.isPerfFeeAfterMgmtFee        
      });

      (<UntypedFormGroup>this.form.controls['other']).patchValue({
        overrideExpected: this.feeData.overrideExpected,
        useFXHedgingCashflows: this.feeData.useFXHedgingCashflows,
        otherExpensesFixed: this.feeData.otherExpensesFixed        
      });
    }
  }

  ngOnInit(): void {
    if(!this.form){
      this.initForm();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm() {
    this.form = new UntypedFormGroup({
      general: new UntypedFormGroup({
        commitment: new UntypedFormControl('', Validators.required),
        currentCapitalCalled: new UntypedFormControl('', Validators.required),
        presetName: new UntypedFormControl('', Validators.required),
        startDate: new UntypedFormControl(''),
        curveCurrency: new UntypedFormControl('', Validators.required),
        curveName: new UntypedFormControl('', Validators.required),
        entity: new UntypedFormControl(''),        
      }),
      financing: new UntypedFormGroup({
        financingMaxCapitalDeploymentPerMonth: new UntypedFormControl(0, Validators.required),
        financingEndDate: new UntypedFormControl('', Validators.required),
        financingStartDate: new UntypedFormControl('', Validators.required),
        financingCommitment: new UntypedFormControl(0, Validators.required)             
      }),
      financingAdvanced: new UntypedFormGroup({
        financingStage1Ratio: new UntypedFormControl(0, Validators.required),
        financingStage2Ratio: new UntypedFormControl(0, Validators.required),
        financingStage3Ratio: new UntypedFormControl(0, Validators.required),
        financingStage1EndDate: new UntypedFormControl('', Validators.required),
        financingStage2EndDate: new UntypedFormControl('', Validators.required)        
      }),
      capitalDeployment: new UntypedFormGroup({
        holdback: new UntypedFormControl('', Validators.required),
        holdingDate: new UntypedFormControl('', Validators.required),
        maxCapitalDeploymentPerMonth: new UntypedFormControl('', Validators.required),
        reinvestInterest: new UntypedFormControl('', Validators.required),        
      }),
      terms: new UntypedFormGroup({
        catchupRate: new UntypedFormControl('', Validators.required),
        hasCatchup: new UntypedFormControl('', Validators.required),
        hurdleCompoundingYears: new UntypedFormControl('', Validators.required),
        hurdleRate: new UntypedFormControl('', Validators.required),
        includeMgmtFee: new UntypedFormControl('', Validators.required),
        includeOtherExpense: new UntypedFormControl('', Validators.required),
        investmentDate: new UntypedFormControl('', Validators.required),
        isMgmtFeesPaidAtEnd: new UntypedFormControl('', Validators.required),
        isPerfFeesPaidAtEnd: new UntypedFormControl('', Validators.required),
        isQuarterEndMgmtFees: new UntypedFormControl('', Validators.required),
        mgmtFeesRate: new UntypedFormControl('', Validators.required),
        otherExpenseRate: new UntypedFormControl('', Validators.required),
        perfFeesRate: new UntypedFormControl('', Validators.required),
        undrawnCommitFeesRate: new UntypedFormControl('', Validators.required),
        useGIRAdjustment: new UntypedFormControl('', Validators.required),
        isPerfFeeAfterMgmtFee: new UntypedFormControl('', Validators.required)        
      }),
      other: new UntypedFormGroup({
        overrideExpected: new UntypedFormControl('No', Validators.required),
        useFXHedgingCashflows: new UntypedFormControl('No', Validators.required),
        otherExpensesFixed: new UntypedFormControl(0, Validators.required)
      })
    })  

    this.changeListeners()
  }

  changeListeners(){
    this.subscriptions.push(this.form.get('general').get('presetName').valueChanges.pipe(
      debounceTime(250)
    ).subscribe(presetName => {
      this.presetNameEmitter.emit(presetName)
    }))
  }
}
