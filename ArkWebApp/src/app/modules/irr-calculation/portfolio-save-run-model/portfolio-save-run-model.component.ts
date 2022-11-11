import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { VPortfolioModel } from 'src/app/shared/models/IRRCalculationsModel';

//type Proceed = "Save" | "SaveRunIRR" | "SaveRunMReturns" | "SaveRunPFees"
type Proceed = "Save" | "SaveRun"


@Component({
  selector: 'app-portfolio-save-run-model',
  templateUrl: './portfolio-save-run-model.component.html',
  styleUrls: ['./portfolio-save-run-model.component.scss']
})
export class PortfolioSaveRunModelComponent implements OnInit {

  isLocal: boolean
  isAutomatic: boolean
  subscriptions: Subscription[] = []
  adaptableApi: AdaptableApi

  originalModelName: string // To keep track if the model name has been changed or not.
  selectedModelName: string
  disableUpdate: boolean
  disableSubmit: boolean
  disableSave: boolean
  disableSaveRun: boolean
  asOfDate: string
  positionIDs: number[] 
  positionIDsSTR: string
  positionIDsSTR_Delimeter: string = ','
  rules
  rulesSTR: string
  rulesSTR_Delimeter: string = '~'
  modelID: number;
  updateMsg: string;
  isSuccess: boolean
  isFailure: boolean
  modelForm: FormGroup
  context: Proceed
  aggregationTypes: {
    type: string,
    levels: string[]
  }[] = []
  baseMeasures: { baseMeasure: string, id: number }[]
  feePresets: { feePreset: string, id: number }[]
  calculationTypes: string[]= ['Monthly Returns','Fee Model','IRR']
  readMore: boolean = false;
  isIRRDisabled: boolean = true;
  isFeePresetDisabled: boolean = true;
  isMonthlyReturnsDisabled: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<PortfolioSaveRunModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private dataService: DataService,
    private irrCalcService: IRRCalcService
  ) { }

  modelValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let MN: boolean = !!control.get('modelName').value
    let AT: boolean = !!control.get('aggregationType').value
    return (MN && AT) ? { validated: true } : { validated: false }
  }
  
  ngOnInit(): void {


    this.subscriptions.push(
      forkJoin([
        this.dataService.getUniqueValuesForField('Returns-Base-Measures'),
        this.dataService.getUniqueValuesForField('PortfolioModeller-Fee-Calculation-Entities')
      ]).subscribe({
        next: (d: any[]) => {
          let bm = d[0]
          let fp = d[1]

          this.baseMeasures = bm.map(item => { return { baseMeasure: item.value, id: item.id } })
          this.feePresets = fp.map(item => { return { feePreset: item.value, id: item.id } })

          this.Init();
          this.changeListeners();
          this.modelForm.updateValueAndValidity()      
        },
        error: (e) => {
          this.dataService.setWarningMsg(`Failed to load fee presets and base measures`)
        }
      })
    )
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  Init(){
    this.isAutomatic = this.data.isAutomatic
    this.isLocal = this.data.isLocal
    this.disableSubmit = false;
    this.disableSave = this.disableSaveRun = true;
    this.isSuccess = this.isFailure = false;
    this.adaptableApi = this.data.adaptableApi;
    this.selectedModelName = this.data.model?.modelName;

    this.originalModelName = this.selectedModelName;
    
    this.asOfDate = this.data.asOfDate;
      /**
       * If no model is selected then disable slide toggle to update.
       */
    if([null, undefined, '', 'default'].includes(this.selectedModelName ? this.selectedModelName.toLowerCase() : null)){
      this.disableUpdate = true
      this.modelID = null
    }
    else{
      this.disableUpdate = false
      /** Setting modelID is mandatory here */
      this.modelID = this.data.model.modelID
    }

    if(this.isAutomatic){
      this.rules = JSON.parse(JSON.stringify(this.adaptableApi.filterApi.getActiveColumnFilters()))
      this.recursiveRemoveKey(this.rules, 'Uuid')
      this.recursiveRemoveKey(this.rules, 'Source')  
    }
    else{
      this.positionIDs = this.data.positionIDs
    }

    this.aggregationTypes = [
      {
        type: 'Fund > Realised/Unrealised > Issuer Short Name',
        levels: ['IssuerFundMerged', 'FundRealisedUnrealised', 'Fund']
      },
      {
        type: 'Realised/Unrealised > Issuer Short Name',
        levels: ['IssuerFirmwide', 'FirmwideRealisedUnrealised', 'Firmwide']
      }
    ]

    this.modelForm = new FormGroup({
      modelName: new FormControl(this.data.model?.modelName, Validators.required),
      modelDesc: new FormControl(this.data.model?.modelDesc),
      isUpdate: new FormControl(!!this.modelID, Validators.required),
      isShared: new FormControl(!!this.data.isShared, Validators.required),
      aggregationType: new FormControl(this.data.aggregationType ?? this.aggregationTypes[0].type, Validators.required),
      baseMeasure: new FormControl(this.baseMeasures[0]?.baseMeasure, Validators.required),
      feePreset: new FormControl(this.feePresets[0]?.feePreset, Validators.required),
      calculationType: new FormControl([], Validators.required)

    })


  }

  changeListeners(){

    this.subscriptions.push(this.modelForm.get('isUpdate').valueChanges.
    pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(isUpdate => {
      if(isUpdate === false){
        this.modelForm.get('modelName').reset()
        this.modelForm.get('modelDesc').reset()
        this.modelForm.get('aggregationType').reset()
      }
    }))

    this.subscriptions.push(this.modelForm.get('calculationType').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(calculationType =>{
      //['IRR','Fee Model','Monthly Returns']
      this.isIRRDisabled = !calculationType.includes('IRR')
      this.isFeePresetDisabled = !calculationType.includes('Fee Model')
      this.isMonthlyReturnsDisabled = !calculationType.includes('Monthly Returns')

      
    }))

    this.subscriptions.push(this.modelForm.get('modelName').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(modelName => {
      if(modelName !== this.originalModelName){
        this.modelForm.patchValue({ isUpdate: false }, { emitEvent: false });
      }
      else if(modelName === this.originalModelName){
        this.modelForm.patchValue({ isUpdate: true }, { emitEvent: false })
      }
    }))
  }

  onProceed(context: Proceed){
    this.context = context

    let model: VPortfolioModel = <VPortfolioModel> {};
    model.modelName = this.modelForm.get('modelName').value;
    model.modelDesc = this.modelForm.get('modelDesc').value;
    model.username = this.dataService.getCurrentUserName();
    model.modelID = (this.modelForm.get('isUpdate').value) ? this.modelID : null;
    model.isLocal = this.isLocal;
    model.isShared = this.modelForm.get('isShared').value;
    model.isManual = !this.isAutomatic;
    model.irrAggrType = this.modelForm.get('aggregationType').value;

    if(this.isAutomatic){
      /** Convert rules object into rules string separated by delimeter that is to be sent to ArkWebApi */
      this.rulesSTR = ''
      this.rules.forEach(rule => {
        this.rulesSTR += JSON.stringify(rule).replace(/"/g,'|') + this.rulesSTR_Delimeter;
      });
      this.rulesSTR = this.rulesSTR.slice(0, -1) // Remove last delimeter

      model.rules = this.rulesSTR;
      model.positionIDs = null;
    }
    else{
      this.positionIDsSTR = ''
      this.positionIDs.forEach(posID => {
        this.positionIDsSTR += String(posID) + this.positionIDsSTR_Delimeter
      })
      this.positionIDsSTR = this.positionIDsSTR.slice(0, -1) // Remove last delimeter

      model.positionIDs = this.positionIDsSTR;
      model.rules = null;
    }

    if(this.isLocal){
      model.localOverrides = this.data.updatedValues
    }
    else{
      model.localOverrides = null;
    }
    this.disableSubmit = true
    this.disableSave = this.disableSaveRun = true
    this.subscriptions.push(this.irrCalcService.putPortfolioModels(model).subscribe({
      next: result => {
        if(result.isSuccess){
          this.modelForm.disable()
          this.isSuccess = true
          this.isFailure = false
          this.updateMsg = 'Successfully updated model';
          this.disableSubmit = true
          this.disableSave = this.disableSaveRun = true
          /*Updating modelID for inserted rule*/
          if(!this.modelForm.get('isUpdate').value){
            // 0th result has inserted key, 1st result has updated key, if any, else they are 0
            this.modelID = result.data[0].value;
          }

          if(context === 'SaveRun'){
            this.dialogRef.close({
              context: this.mapCalTypeToContext(this.modelForm.get('calculationType').value),
              isSuccess:true,
              baseMeasure: this.isMonthlyReturnsDisabled? null: this.modelForm.get('baseMeasure').value,
              feePreset: this.isFeePresetDisabled? null:  this.modelForm.get('feePreset').value
            })
          }

        }
        else{
          this.isSuccess = false
          this.isFailure = true
          this.updateMsg = 'Failed to update model';
        }
      },
      error: error => {
        console.error("Failed to insert/update model")
        this.isSuccess = false
        this.isFailure = true
        this.updateMsg = 'Failed to update model';
      }
    }))
  }
  mapCalTypeToContext(calulationTypes:string[]):string[] {
    //['IRR','Fee Model','Monthly Returns']
    //type Proceed = "Save" | "SaveRunIRR" | "SaveRunMReturns" | "SaveRunPFees"
    let mappedContext = []
    if(calulationTypes.includes('IRR')){
      mappedContext.push('SaveRunIRR')
    }
    if(calulationTypes.includes('Fee Model')){
      mappedContext.push('SaveRunPFees')
    }
    if(calulationTypes.includes('Monthly Returns')){
      mappedContext.push('SaveRunMReturns')
    }
    return mappedContext
  }

  recursiveRemoveKey = (object, deleteKey) => {
    delete object[deleteKey];
    
    Object.values(object).forEach((val) => { 
      if (typeof val !== 'object') return;
      
      this.recursiveRemoveKey(val, deleteKey);
    })
  }

  onClose(){
    this.dialogRef.close({
      context: this.context,
      isSuccess: this.isSuccess})
  }
}
