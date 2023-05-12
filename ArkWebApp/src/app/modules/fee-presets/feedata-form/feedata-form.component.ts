import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  @Output() fundNameEmitter = new EventEmitter<string>();

  subscriptions: Subscription[] = []
  form: FormGroup
  stepperError: string = 'Incomplete'
  constructor() { }

  ngOnChanges(changes: SimpleChanges){
    if(!this.form){
      this.initForm();
    }

    if(changes?.feeData?.currentValue && (this.action === PresetGridAction.EDIT || this.action === PresetGridAction.CLONE)){

      (<FormGroup>this.form.controls['general']).patchValue({
        commitment: this.feeData.commitment,
        currentCapitalCalled: this.feeData.currentCapitalCalled,
        fundName: this.feeData.fundName,
        startDate: this.feeData.startDate,
        curveCurrency: this.feeData.curveCurrency,
        curveName: this.feeData.curveName,
        entity: this.feeData.entity
      });

      (<FormGroup>this.form.controls['financing']).patchValue({
        financingCommitment: this.feeData.financingCommitment,
        financingEndDate: this.feeData.financingEndDate,
        financingMaxCapitalDeploymentPerMonth: this.feeData.financingMaxCapitalDeploymentPerMonth,
        financingStartDate: this.feeData.financingStartDate
      });

      (<FormGroup>this.form.controls['financingAdvanced']).patchValue({
        financingStage1Ratio: this.feeData.financingStage1Ratio,
        financingStage2Ratio: this.feeData.financingStage2Ratio,
        financingStage3Ratio: this.feeData.financingStage3Ratio,
        financingStage1EndDate: this.feeData.financingStage1EndDate,
        financingStage2EndDate: this.feeData.financingStage2EndDate
      });
      
      (<FormGroup>this.form.controls['capitalDeployment']).patchValue({
        holdback: this.feeData.holdback,
        holdingDate: this.feeData.holdingDate,
        maxCapitalDeploymentPerMonth: this.feeData.maxCapitalDeploymentPerMonth,
        reinvestInterest: this.feeData.reinvestInterest
      });

      (<FormGroup>this.form.controls['terms']).patchValue({
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
        undrawnCommitFeesRate: this.feeData.undrawnCommitFeesRate        
      });

      (<FormGroup>this.form.controls['other']).patchValue({
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
    this.form = new FormGroup({
      general: new FormGroup({
        commitment: new FormControl('', Validators.required),
        currentCapitalCalled: new FormControl('', Validators.required),
        fundName: new FormControl('', Validators.required),
        startDate: new FormControl(''),
        curveCurrency: new FormControl('', Validators.required),
        curveName: new FormControl('', Validators.required),
        // entity: new FormControl(''),        
      }),
      financing: new FormGroup({
        financingMaxCapitalDeploymentPerMonth: new FormControl(0, Validators.required),
        financingEndDate: new FormControl('', Validators.required),
        financingStartDate: new FormControl('', Validators.required),
        financingCommitment: new FormControl(0, Validators.required)             
      }),
      financingAdvanced: new FormGroup({
        financingStage1Ratio: new FormControl(0, Validators.required),
        financingStage2Ratio: new FormControl(0, Validators.required),
        financingStage3Ratio: new FormControl(0, Validators.required),
        financingStage1EndDate: new FormControl('', Validators.required),
        financingStage2EndDate: new FormControl('', Validators.required)        
      }),
      capitalDeployment: new FormGroup({
        holdback: new FormControl('', Validators.required),
        holdingDate: new FormControl('', Validators.required),
        maxCapitalDeploymentPerMonth: new FormControl('', Validators.required),
        reinvestInterest: new FormControl('', Validators.required),        
      }),
      terms: new FormGroup({
        catchupRate: new FormControl('', Validators.required),
        hasCatchup: new FormControl('', Validators.required),
        hurdleCompoundingYears: new FormControl('', Validators.required),
        hurdleRate: new FormControl('', Validators.required),
        includeMgmtFee: new FormControl('', Validators.required),
        includeOtherExpense: new FormControl('', Validators.required),
        investmentDate: new FormControl('', Validators.required),
        isMgmtFeesPaidAtEnd: new FormControl('', Validators.required),
        isPerfFeesPaidAtEnd: new FormControl('', Validators.required),
        isQuarterEndMgmtFees: new FormControl('', Validators.required),
        mgmtFeesRate: new FormControl('', Validators.required),
        otherExpenseRate: new FormControl('', Validators.required),
        perfFeesRate: new FormControl('', Validators.required),
        undrawnCommitFeesRate: new FormControl('', Validators.required)        
      }),
      other: new FormGroup({
        overrideExpected: new FormControl('No', Validators.required),
        useFXHedgingCashflows: new FormControl('No', Validators.required),
        otherExpensesFixed: new FormControl(0, Validators.required)
      })
    })  

    this.changeListeners()
  }

  changeListeners(){
    this.subscriptions.push(this.form.get('general').get('fundName').valueChanges.pipe(
      debounceTime(250)
    ).subscribe(fundName => {
      this.fundNameEmitter.emit(fundName)
    }))
  }
}
