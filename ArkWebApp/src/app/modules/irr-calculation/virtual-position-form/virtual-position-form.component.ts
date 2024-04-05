import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { first, map, startWith } from 'rxjs/operators';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { DataService } from 'src/app/core/services/data.service';
import { getAmountNumber, getDateFromStr, getMomentDateStr } from 'src/app/shared/functions/utilities';
import { VPositionModel } from 'src/app/shared/models/IRRCalculationsModel';
import { PortfolioModellerService } from '../service/portfolio-modeller.service';
import { RefService } from '../portfolio-modeller/ref/ref.service';

@Component({
  selector: 'app-virtual-position-form',
  templateUrl: './virtual-position-form.component.html',
  styleUrls: ['./virtual-position-form.component.scss']
})
export class VirtualPositionFormComponent implements OnInit {

  form: UntypedFormGroup
  stepperError: string = 'Incomplete'
  subscriptions:Subscription[] =[]

  staticFields = ['spread','pikMargin','unfundedMargin','floorRate','dealTypeCS','dealType','seniority']

  assetTypeNames = ['Loan','Bond','Equity']

  disableSave: boolean=true;
  issuerShortNameList: string[] = []
  filteredISSOptions: Observable<any>;
  filteredAssetsOptions: Observable<string[]>;
  assetList: string[] = [];
  filteredCurrencyOptions: Observable<string[]>;
  filteredFundCcyOptions: Observable<string[]>;
  currencyList: string[] = [];
  filteredAssetTypeNameOptions: Observable<string[]>;
  benchMarkIndexList: string[] =[];
  filteredBenchmarkIndexOptions: Observable<string[]>;
  dealTypeCSList: string[] = [];
  filteredDealTypeCSOptions:  Observable<string[]>;
  dealTypeList: string[] = [];
  filteredDealTypeOptions:  Observable<string[]>;
  seniorityList: string[] = [];
  filteredSeniorityOptions:  Observable<string[]>;

  constructor(
    private irrCalcService: IRRCalcService,
    public dialogRef: MatDialogRef<VirtualPositionFormComponent>,
    public refSvc: RefService,
    public dataSvc: DataService,
    @Inject(MAT_DIALOG_DATA) public params:{
      asOfDate: string,
      context: 'ADD' | 'UPDATE',
      row: any
    }
  ) { 
    this.initForm()
  }

  save(){
    let virtualPosition: VPositionModel = this.getVPositionModel()
    this.irrCalcService.putVPositionModel(virtualPosition).pipe(first()).subscribe(
      {
        next:(data)=>{
          this.dialogRef.close({
            newPositionData: {...virtualPosition, 'expectedDate': virtualPosition.expectedExitDate, 'expectedPrice': virtualPosition.expectedExitPrice } ,
            responseData:data
          })
        },
        error:(err)=> {
          console.error(err)
          this.dataSvc.setWarningMsg("Could not save the new virtual position","dismiss","ark-theme-snackbar-error")
        },
      }
    )
  }

  getVPositionModel(){

    let vPosition: VPositionModel = {
      positionID: this.params.row?.['positionID'],
      assetID: this.params.row?.['assetID'],

      asset : this.form.controls['position'].get('asset').value,
      fundHedging : 'Virtual FundHedging',
      issuerShortName :  this.form.controls['position'].get('issuerShortName').value,
      assetTypeName : this.form.controls['position'].get('assetTypeName').value,
      fund :  'Virtual Fund',
      ccy : this.form.controls['position'].get('ccy').value,
      fundCcy: this.form.controls['position'].get('fundCcy').value,
      costPrice :  getAmountNumber(this.form.controls['position'].get('costPrice').value),
      faceValueIssue :  getAmountNumber(this.form.controls['position'].get('faceValueIssue').value),
      entryDate : getMomentDateStr(this.form.controls['position'].get('entryDate').value),
      expectedExitDate : getMomentDateStr(this.form.controls['position'].get('expectedExitDate').value),
      expectedExitPrice : this.form.controls['position'].get('expectedExitPrice').value,
      maturityDate:getMomentDateStr(this.form.controls['static'].get('maturityDate').value)==="Invalid date"?null:getMomentDateStr(this.form.controls['static'].get('maturityDate').value),
      benchMarkIndex:this.form.controls['static'].get('benchMarkIndex').value,
      createdBy:this.dataSvc.getCurrentUserName(),
      modifiedBy:this.dataSvc.getCurrentUserName(),
      spread: this.form.controls['static'].get('spread').value,
      pikMargin: this.form.controls['static'].get('pikMargin').value,
      unfundedMargin: this.form.controls['static'].get('unfundedMargin').value,
      floorRate: this.form.controls['static'].get('floorRate').value,
      dealTypeCS: this.form.controls['static'].get('dealTypeCS').value,
      dealType: this.form.controls['static'].get('dealType').value,
      seniority: this.form.controls['static'].get('seniority').value
    }
    return vPosition
  }
  
  cancel(){
    this.dialogRef.close()
  }

  private _filter(value: string,optionList:string[]): string[] {
    const filterValue = value.toLowerCase();
    if(filterValue==='' || filterValue===null){
      return optionList
    }

    return optionList.filter(option => option.toLowerCase().includes(filterValue));
  }

  changeListeners(){
    this.subscriptions.push(this.form.statusChanges.subscribe(data=>{
      if(data==='INVALID'){
        this.disableSave = true
      }else{
        this.disableSave = false
      }
    }))

    this.filteredISSOptions = this.form.controls.position.get('issuerShortName').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '',this.refSvc.issuerShortNameList)),
    );

    this.filteredAssetsOptions = this.form.controls.position.get('asset').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '',this.refSvc.assetList)),
    );

    this.filteredCurrencyOptions = this.form.controls.position.get('ccy').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '',this.refSvc.currencyList)),
    );

    this.filteredFundCcyOptions = this.form.controls.position.get('fundCcy').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '',this.refSvc.currencyList)),
    );
    
    this.filteredAssetTypeNameOptions = this.form.controls.position.get('assetTypeName').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '',this.assetTypeNames)),
    );

    this.filteredBenchmarkIndexOptions = this.form.controls.static.get('benchMarkIndex').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '',this.refSvc.benchMarkIndexList)),
    );

    this.filteredDealTypeCSOptions = this.form.controls.static.get('dealTypeCS').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '',this.refSvc.dealTypeCSList)),
    );

    this.filteredDealTypeOptions = this.form.controls.static.get('dealType').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '',this.refSvc.dealTypeList)),
    );

    this.filteredSeniorityOptions = this.form.controls.static.get('seniority').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '',this.refSvc.seniorityList)),
    );
  }

  initForm() {
    this.form = new UntypedFormGroup({
      position: new UntypedFormGroup({
        issuerShortName: new UntypedFormControl('', Validators.required),
        asset: new UntypedFormControl('', Validators.required),
        assetTypeName: new UntypedFormControl('', [Validators.required,this.assetTypeNameValidator]),
        ccy: new UntypedFormControl('', [Validators.required,this.ccyValidator]),
        fundCcy: new UntypedFormControl('EUR', [Validators.required, this.ccyValidator]),
        faceValueIssue: new UntypedFormControl('', Validators.required),
        costPrice: new UntypedFormControl('', Validators.required),
        entryDate: new UntypedFormControl('',[Validators.required,this.dateValidator]),
        expectedExitPrice: new UntypedFormControl('',[Validators.required]),
        expectedExitDate: new UntypedFormControl('',[Validators.required,this.dateValidator]),
      }),

      static: new UntypedFormGroup({
        maturityDate: new UntypedFormControl(''),
        benchMarkIndex: new UntypedFormControl('',[Validators.required,this.benchMarkIndexValidator]),
        spread: new UntypedFormControl(),
        pikMargin: new UntypedFormControl(),
        unfundedMargin: new UntypedFormControl(),
        floorRate: new UntypedFormControl(),
        dealTypeCS: new UntypedFormControl('',[this.dealTypeCSValidator]),
        dealType:new UntypedFormControl('',[this.dealTypeValidator]),
        seniority:new UntypedFormControl('',[this.seniorityValidator])
      })
    },[this.conditionalValidator])
  }

  ngOnInit(): void {
    this.benchMarkIndexList = this.refSvc.benchMarkIndexList
    this.assetList = this.refSvc.assetList
    this.issuerShortNameList = this.refSvc.issuerShortNameList
    this.currencyList = this.refSvc.currencyList
    this.dealTypeCSList = this.refSvc.dealTypeCSList
    this.dealTypeList = this.refSvc.dealTypeList
    this.seniorityList = this.refSvc.seniorityList


    let row: any = this.params.row

    if(this.params.context === 'UPDATE'){
      this.form.patchValue({
        position: {
          issuerShortName: row['issuerShortName'],
          asset: row['asset'],
          assetTypeName: row['assetTypeName'],
          ccy: row['ccy'],
          fundCcy: row['fundCcy'],
          faceValueIssue: row['faceValueIssue'],
          costPrice: row['costPrice'],
          entryDate: getDateFromStr(row['entryDate'], 'DD/MM/YYYY'),
          expectedExitPrice: row['globalExpectedPrice'],
          expectedExitDate: getDateFromStr(row['globalExpectedDate'], 'DD/MM/YYYY')
        },
        static: {
          maturityDate: getDateFromStr(row['globalMaturityDate'], 'DD/MM/YYYY'),
          benchMarkIndex: row['globalBenchMarkIndex'],
          spread: row['globalSpread'],
          pikMargin: row['globalPikMargin'],
          unfundedMargin: row['globalUnfundedMargin'],
          floorRate: row['globalFloorRate'],
          dealType: row['dealType'],
          dealTypeCS: row['dealTypeCS'],
          seniority: row['seniority'],
        }
      })
    }
    this.changeListeners()
  }

  seniorityValidator:ValidatorFn=(formControl:AbstractControl):ValidationErrors|null=>{
    return (this.seniorityList.includes(formControl.value) || formControl.value==='')?null:{invalid:true}
  }

  dealTypeCSValidator:ValidatorFn=(formControl:AbstractControl):ValidationErrors|null=>{
    return (this.dealTypeCSList.includes(formControl.value) || formControl.value==='')?null:{invalid:true}
  }

  dealTypeValidator:ValidatorFn=(formControl:AbstractControl):ValidationErrors|null=>{
    return (this.dealTypeList.includes(formControl.value) || formControl.value==='')?null:{invalid:true}
  }

  conditionalValidator:ValidatorFn=(formControl:AbstractControl):ValidationErrors|null=>{
    let isInvalid:boolean = false
    if(this.form?.controls.position.get('assetTypeName').value ==='Loan' || this.form?.controls.position.get('assetTypeName').value ==='Bond'){
      if(this.form?.controls.static.get('maturityDate').value===null || this.form?.controls.static.get('maturityDate').value===''){
        this.form?.controls.static.get('maturityDate').setErrors({invalid:true})
        isInvalid = true
      }else{
        this.form?.controls.static.get('maturityDate').setErrors(null)
      }

      if(this.form?.controls.static.get('benchMarkIndex').value===null || this.form?.controls.static.get('benchMarkIndex').value===''){
        this.form?.controls.static.get('benchMarkIndex').setErrors({invalid:true})
        isInvalid = true
      }else{
        this.form?.controls.static.get('benchMarkIndex').setErrors(null)
      }

      return isInvalid?{invalid:true}:null
      
    }else{
      this.form?.controls.static.get('benchMarkIndex').setErrors(null)
      this.form?.controls.static.get('maturityDate').setErrors(null)
      return null
    }
  }

  benchMarkIndexValidator:ValidatorFn=(formControl:AbstractControl):ValidationErrors|null=>{
    return (this.benchMarkIndexList.includes(formControl.value) || formControl.value==='')?null:{invalid:true}
  }

  assetTypeNameValidator:ValidatorFn=(formControl:AbstractControl):ValidationErrors|null=>{
    return this.assetTypeNames.includes(formControl.value)?null:{invalid:true}
  }

  ccyValidator:ValidatorFn=(formControl:AbstractControl):ValidationErrors|null=>{
    return this.currencyList.includes(formControl.value)?null:{invalid:true}
  }

  dateValidator:ValidatorFn=(formControl:AbstractControl):ValidationErrors|null=>{
    let date: string = getMomentDateStr(formControl.value)

    let MD: boolean = (date !== null && date !== 'Invalid date')
    return MD?null:{invalid:true}
    
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>sub.unsubscribe())
  }
}