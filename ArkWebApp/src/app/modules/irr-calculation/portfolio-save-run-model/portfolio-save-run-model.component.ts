import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { VPortfolioModel } from 'src/app/shared/models/IRRCalculationsModel';

type Proceed = "Save" | "SaveRun"

@Component({
  selector: 'app-portfolio-save-run-model',
  templateUrl: './portfolio-save-run-model.component.html',
  styleUrls: ['./portfolio-save-run-model.component.scss']
})
export class PortfolioSaveRunModelComponent implements OnInit {

  isLocal: string
  autoManualOption: string
  subscriptions: Subscription[] = []
  adaptableApi: AdaptableApi

  originalModelName: string // To keep track if the model name has been changed or not.
  selectedModelName: string
  disableUpdate: boolean
  disableSubmit: boolean
  disableSave: boolean
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
  modelForm: UntypedFormGroup
  context: Proceed
  aggregationTypes: {
    type: string,
    levels: string[]
  }[] = []
  baseMeasures: { baseMeasure: string, id: number }[]
  feePresets: { feePreset: string, id: number }[]
  calculationTypes: string[]= ['Monthly Returns','Fee Model','IRR']
  curveRates: { curveRateName: string, rate: number }[]
  fundCurrencies: { fundCurrency: string, id: number }[]
  readMore: boolean = false;
  isIRRDisabled: boolean = true;
  isFeePresetDisabled: boolean = true;
  isMonthlyReturnsDisabled: boolean = true;
  removableChip: boolean = false;
  isClonedModel: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PortfolioSaveRunModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private dataService: DataService,
    private irrCalcService: IRRCalcService,
    public msalUserService: MsalUserService
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
        this.dataService.getUniqueValuesForField('PortfolioModeller-Fee-Calculation-Entities'),
        this.dataService.getRefDatatable('[ArkUI].[IRRAggregationLevelRef]'),
        this.dataService.getUniqueValuesForField('BaseCurve-Rates'),
        this.dataService.getUniqueValuesForField('fundCcy')
      ]).subscribe({
        next: (d: any[]) => {
          let bm = d[0]
          let fp = d[1]
          let aggrRefDt = d[2]
          let bcr = d[3]
          let fcurr = d[4]

          if(typeof aggrRefDt === 'string')
            aggrRefDt = JSON.parse(aggrRefDt)

          this.baseMeasures = bm.map(item => { return { baseMeasure: item.value, id: item.id } })
          this.feePresets = fp.map(item => { return { feePreset: item.value, id: item.id } })
          this.allAggrCols = aggrRefDt.map(x => x?.['Fields'])
          this.mapGroupCols = aggrRefDt.filter(x => x?.['IsResultColumn']).map(x => x?.['Fields'])
          this.curveRates = bcr.map(item => { return { curveRateName: item.value, rate: item.id } })
          this.fundCurrencies = fcurr.map(item => { return { fundCurrency: item.value, id: item.id } })

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
    this.autoManualOption = this.data.autoManualOption
    this.isLocal = this.data.isLocal
    this.disableSubmit = false;
    this.disableSave = true;
    this.isSuccess = this.isFailure = false;
    this.adaptableApi = this.data.adaptableApi;
    this.selectedModelName = this.data.model?.modelName;

    this.originalModelName = this.selectedModelName;
    
    this.asOfDate = this.data.asOfDate;
    this.isClonedModel = this.data.isClonedModel ? this.data.isClonedModel:false;
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

    if(this.autoManualOption == "Automatic" && this.data.isClonedModel){
      this.rules = this.data.clonnedRules
    }
    else if(this.autoManualOption == "Automatic"){
      this.rules = JSON.parse(JSON.stringify(this.adaptableApi.filterApi.getActiveColumnFilters()))
      this.rules = this.rules.filter(f => f['ColumnId'] !== 'isOverride')
      this.recursiveRemoveKey(this.rules, 'Uuid')
      this.recursiveRemoveKey(this.rules, 'Source')  
    }
    else{
      this.positionIDs = this.data.positionIDs
    }

    this.aggregationTypes = [
      { type: 'Fund > Realised/Unrealised > Issuer Short Name', levels: ['Fund', 'RealisedUnrealised', 'Issuer Short Name'] },
      { type: 'Realised/Unrealised > Issuer Short Name', levels: ['RealisedUnrealised', 'Issuer Short Name'] },
      { type: 'Firmwide > Deal Type(CS) > Issuer Short Name', levels: ['Firmwide', 'DealTypeCS', 'Issuer Short Name'] },
      { type: 'Firmwide > Issuer Short Name > Seniority', levels: ['Firmwide', 'Issuer Short Name', 'Seniority'] },
      { type: 'Firmwide > Realised/Unrealised > Issuer Seniority', levels: ['Firmwide', 'RealisedUnrealised', 'Issuer Short Name', 'Seniority'] },
      { type: 'Fund > Realised/Unrealised > Issuer Seniority', levels: ['Fund', 'RealisedUnrealised', 'Issuer Short Name', 'Seniority'] },
      { type: 'Issuer Short Name > Asset', levels: ['Issuer Short Name', 'Asset'] },
      { type: 'Custom', levels: [] }
    ]

    let aggrStr: string = this.data.aggregationType ?? this.aggregationTypes[0].type
    let feePreset: string = this.data.feePreset ?? this.feePresets[0]?.feePreset
    
    this.modelForm = new UntypedFormGroup({
      modelName: new UntypedFormControl(this.data.model?.modelName, Validators.required),
      modelDesc: new UntypedFormControl(this.data.model?.modelDesc),
      isUpdate: new UntypedFormControl(!!this.modelID, Validators.required),
      isShared: new UntypedFormControl(this.data.isShared == "Yes" ? true:false, Validators.required),
      latestWSOStatic: new UntypedFormControl(!!this.data.latestWSOStatic, Validators.required),
      aggregationType: new UntypedFormControl(aggrStr, Validators.required),
      baseMeasure: new UntypedFormControl(this.baseMeasures[0]?.baseMeasure, Validators.required),
      feePreset: new UntypedFormControl(feePreset, Validators.required),
      calculationType: new UntypedFormControl([], this.isClonedModel ? [] : Validators.required),
      curveRateName: new UntypedFormControl(this.curveRates.filter(cr => cr.rate === 0)[0].curveRateName, Validators.required),
      fundCurrency: new UntypedFormControl(this.data.model?.fundCurrency??'EUR', Validators.required),
      aggrStr: new UntypedFormControl('')    })

    this.updateAggregationOrder(aggrStr);
  }


  public get disableSaveAndRun(): boolean {

    if(this.isSuccess)
      return true;
      
    let disable: boolean = true;
    disable = this.modelForm.invalid;

    if(!this.isIRRDisabled)
      disable = disable || !this.aggrCols?.length;

    return disable;
  }

  changeListeners(){

    this.filteredAggrCols = this.modelForm.get('aggrStr').valueChanges.pipe(
      startWith(''),
      map((aggrCol: string | null) => (
        aggrCol ? this._filter(aggrCol) : this.allAggrCols.slice()
      )),
    );

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

    this.subscriptions.push(this.modelForm.get('aggregationType').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((aggrStr) => {

      this.updateAggregationOrder(aggrStr);
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

  updateAggregationOrder(aggrStr: string){
    
    this.removableChip = false;
    if(aggrStr === 'Custom'){
      this.removableChip = true
      this.aggrCols = []
      this.modelForm.get('aggrStr').enable();
      return;
    }

    for(let i: number = 0; i < this.aggregationTypes.length; i+=1){
      if(aggrStr === this.aggregationTypes[i].type){
        this.aggrCols = this.aggregationTypes[i].levels;
        break;
      }
    }

    // Input disable wasn't working on initial form load, hence wrapping in setTimeout to push it to browser queue and to run at last.
    setTimeout(() => {
      this.modelForm.get('aggrStr').disable();
    }, 0)
  }

  onProceed(context: Proceed){

    if(this.autoManualOption == "Automatic" && this.rules.length==0){
      this.dataService.setWarningMsg(`No rules applicable for the model. Please select required filters.`);
      return
    }
    else if(this.autoManualOption == "Manual" && this.positionIDs.length==0)
    {
      this.dataService.setWarningMsg(`No positions applicable for the model. Please select required positions.`);
      return
    }

    this.context = context

    let model: VPortfolioModel = <VPortfolioModel> {};
    model.modelName = this.modelForm.get('modelName').value;
    model.modelDesc = this.modelForm.get('modelDesc').value;
    model.username = this.dataService.getCurrentUserName();
    model.modelID = (this.modelForm.get('isUpdate').value) ? this.modelID : null;
    model.isLocal = this.isLocal;
    model.isShared = this.modelForm.get('isShared').value ? "Yes" : "No";
    model.autoManualOption = this.autoManualOption;
    model.includeFutureUpfrontFees = this.modelForm.get('includeFutureUpfrontFees').value;
    model.irrAggrType = this.modelForm.get('aggregationType').value;
    model.fundCurrency = this.modelForm.get('fundCurrency').value;
   
    model.feePreset = this.modelForm.get('feePreset').value;
    model.isAdmin = this.msalUserService.isUserAdmin();
    
    let curveRateName = this.modelForm.get('curveRateName').value;
    model.curveRateDelta = this.curveRates.filter(cr => cr.curveRateName === curveRateName)?.['0']?.['rate']

    if(this.autoManualOption == "Automatic"){
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
    this.disableSave = true
    this.subscriptions.push(this.irrCalcService.putPortfolioModels(model).subscribe({
      next: result => {
        if(result.isSuccess){
          this.modelForm.disable()
          this.isSuccess = true
          this.isFailure = false
          this.updateMsg = 'Successfully updated model';
          this.disableSubmit = true
          this.disableSave = true
          /*Updating modelID for inserted rule*/
          if(!this.modelForm.get('isUpdate').value){
            // 0th result has inserted key, 1st result has updated key, if any, else they are 0
            this.modelID = result.data[0].value;
          }

          if(context === 'SaveRun'){
            this.dialogRef.close({
              context: this.mapCalTypeToContext(this.modelForm.get('calculationType').value),
              isSuccess:true,
              baseMeasure: this.isMonthlyReturnsDisabled ? null : this.modelForm.get('baseMeasure').value,
              feePreset: this.isFeePresetDisabled ? null :  this.modelForm.get('feePreset').value,
              irrAggrType: this.isIRRDisabled ? null : this.modelForm.get('aggregationType').value,
              curveRateDelta: this.isIRRDisabled ? null : model.curveRateDelta,
              includeFutureUpfrontFees: this.isIRRDisabled ? null : model.includeFutureUpfrontFees,
              fundCurrency: this.modelForm.get('fundCurrency').value,  
              // Setting dynamically set aggregation order.
              aggrStr: this.aggrCols,
              mapGroupCols: this.mapGroupCols
            })
          }

        }
        else{
          this.isSuccess = false
          this.isFailure = true
          this.updateMsg = 'Failed to update model: '+result.returnMessage;
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


  filteredAggrCols: Observable<string[]>;
  aggrCols: string[] = ['Fund'];
  allAggrCols: string[] = ['Fund', 'DealTypeCS', 'Issuer Short Name', 'Seniority', 'Realised/Unrealised'];
  mapGroupCols: string[] = [];

  @ViewChild('aggrColInput') aggrColInput: ElementRef<HTMLInputElement>;

  addAggrCol(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our aggrCol
    if (this.allAggrCols.includes(value) && !this.aggrCols.includes(value)) {
      this.aggrCols.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.modelForm.get('aggrStr').setValue('');
  }

  removeAggrCol(aggrCol: string): void {
    const index = this.aggrCols.indexOf(aggrCol);

    if (index >= 0) {
      this.aggrCols.splice(index, 1);
    }
  }

  selectedAggrCol(event: MatAutocompleteSelectedEvent): void {

    let value: string = event.option.viewValue;

    // Add our aggrCol
    if (this.allAggrCols.includes(value) && !this.aggrCols.includes(value)) {
      this.aggrCols.push(value);
    }
    this.aggrColInput.nativeElement.value = '';
    this.modelForm.get('aggrStr').setValue('');
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allAggrCols.filter(aggrCol => aggrCol.toLowerCase().includes(filterValue));
  }
}
