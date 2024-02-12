import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapitalActivityModel, CapitalInvestment, ICapitalActivityConfig } from 'src/app/shared/models/CapitalActivityModel';
import { Subscription, combineLatest, config, of } from 'rxjs';
import { Observable } from 'rxjs';
import { startWith, map, tap, distinctUntilChanged, take, filter, switchMap, debounceTime } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { ModalService } from '../services/modal.service';
import { FormUtilService } from '../services/form-util.service';
import { ConfigurationService } from '../services/configuration.service';
import { DataService } from 'src/app/core/services/data.service';
import { getMomentDateStr_ddmmyyyy } from 'src/app/shared/functions/utilities';
import { start } from 'repl';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  providers: [FormUtilService]
})
export class FormComponent implements OnInit{

  @Input() investmentData: CapitalInvestment[]
  constructor(public dialogRef: MatDialogRef<FormComponent>,
    public formUtilSvc: FormUtilService, 
    @Inject(MAT_DIALOG_DATA) public data: {
      rowData : any,
      adapTableApi: AdaptableApi,
      adapTableApiInvstmnt: AdaptableApi,
      actionType: 'LINK-ADD' | 'ADD' | 'EDIT',
      capitalTypes: string[],
      capitalSubTypes: string[],
      strategies: string[],
      capitalTypeSubtypeAssociation: any,
      refData: any,
      gridData: any,
      isLocked: boolean
    },
    public dialog: MatDialog,
    private modalSvc: ModalService,
    public configSvc: ConfigurationService,
    public dataSvc: DataService,
    public utilSvc:UtilService) { }
  model: CapitalActivityModel = <CapitalActivityModel>{};

  subscriptions: Subscription[] = [];

  valueDate$: Observable<Date>;
  capitalTypeFilteredOptions: Observable<string[]>;
  capitalSubTypeFilteredOptions: Observable<string[]>;
  strategyFilteredOptions: Observable<string[]>;
  fundHedgingFilteredOptions: Observable<string[]>;
  assetFilteredOptions: Observable<[string, number][]>;
  issuerFilteredOptions: Observable<[string, string, number][]>;
  fundCcyFilteredOptions: Observable<string[]>;
  posCcyFilteredOptions: Observable<string[]>;
  actionType: 'LINK-ADD' | 'ADD' | 'EDIT'
  gridData: any[] = [];  
  isNAVType: boolean = false;  // Hiding issuer and asset when CapitalType = 'NAV' or multiple issuers have been selected during linking
  isMultipleIssuers: boolean = false;

  form = new FormGroup({
    valueDate: new FormControl(null, Validators.required),
    callDate: new FormControl(null, Validators.required),
    narrative: new FormControl(null),
    capitalType: new FormControl(null, Validators.required),
    capitalSubType: new FormControl(null, Validators.required),
    strategy: new FormControl(null),
    fundCcy: new FormControl(null, Validators.required),
    totalAmount: new FormControl(null, Validators.required),
    fundHedging: new FormControl(null, Validators.required),
    issuerShortName: new FormControl(null),
    asset: new FormControl(null)
  },{ validators: this.formUtilSvc.capitalValidator }
  );

  changeListeners(): void{

    /** _ since statusChanges returns INVALID form even when it is valid. Hence, using custom cross field validator: `capitalValidator` */

    this.subscriptions.push(this.form.statusChanges.subscribe(status => {

      let isValid: boolean = this.form.errors?.['validated']
      this.modalSvc.updateFormStatus(isValid)

      
      this.modalSvc.capitalActivity = this.model = this.formUtilSvc.getCapitalActivityForm(this.form);
      let capitalID: number = this.data.rowData?.['capitalID'];
      if(capitalID && this.actionType === 'EDIT'){
        this.modalSvc.capitalActivity.capitalID = capitalID;
        this.model.capitalID = capitalID;
      }
      else {
        this.modalSvc.capitalActivity.capitalID = this.model.capitalID = null;
      }

    }))

    /** Listening for changing the autocomplete options, based on search */
    
    this.fundHedgingFilteredOptions = this.form.get('fundHedging').valueChanges.pipe(
      startWith(''),
      map(value => this.formUtilSvc._filter(this.formUtilSvc.fundHedgingOptions, value))
    );

    this.issuerFilteredOptions = this.form.get('issuerShortName').valueChanges.pipe(
      startWith(''),
      map(value => this.formUtilSvc._filterIS(value))
    )

    this.assetFilteredOptions = this.form.get('asset').valueChanges.pipe(
      startWith(''),
      map(value => {
        return (this.formUtilSvc._filterAsset(value))
      })
    )

    this.strategyFilteredOptions = this.form.get('strategy').valueChanges.pipe(
      startWith(''),
      map(value => {
        return (this.formUtilSvc._filter(this.formUtilSvc.strategyOptions, value))
      })
    )
    
    this.fundCcyFilteredOptions = this.form.get('fundCcy').valueChanges.pipe(
      startWith(''),
      map(value => this.formUtilSvc._filter(this.formUtilSvc.fundCcyOptions, value))
    )

    this.capitalTypeFilteredOptions = this.form.get('capitalType').valueChanges.pipe( 
      startWith(''), 
      tap((capitalType: any) => {

        // Received value from valuechanges != form.get('capitaltype).value.
        // RHS has the latest value that we need whilst the valuechanges has been triggered for '' (from startWith).
        // Observed that valuechanges is not getting triggered for patchValue() calls made inside ngOnInit. Only getting triggered for it's input value of '' or any UI based user edits.

        capitalType = this.form.get('capitalType').value;

        this.formUtilSvc.setSubtypeOptions(capitalType);
        if(!this.formUtilSvc.capitalSubTypeOptions.includes(this.form.get('capitalSubType').value)){
          this.form.get('capitalSubType').reset();
        }
        if(capitalType === 'NAV'){
          this.form.get('issuerShortName').reset();
          this.form.get('asset').reset();

          this.isNAVType = true;
        }
        else 
          this.isNAVType = false;
        }),
      map(value => this.formUtilSvc._filter(this.formUtilSvc.capitalTypeOptions, value)),

    )

    this.capitalSubTypeFilteredOptions = this.form.get('capitalSubType').valueChanges.pipe(startWith(''), 
      map(value => this.formUtilSvc._filterCapitalSubtype(value))
    )

    this.valueDate$ = this.form.get('valueDate').valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    )
    
    this.subscriptions.push(combineLatest([this.valueDate$,this.configSvc.capitalActivityConfig$]).pipe(
      map(([valueDate,config]) => {
        if(new Date(valueDate) <= new Date(config?.lockDate) && valueDate!=null ){
          if(this.data.actionType=='EDIT' && this.data.isLocked){
            this.modalSvc.updateHideSubmitButton(true);
            this.form.disable();
          }          
          return "The capital activities till "+getMomentDateStr_ddmmyyyy(config.lockDate)+" are locked."
        }          
        else{
          return ''
        }          
      })
    )
    .subscribe(formValidationMessage => {
      this.modalSvc.updateFormValidation(formValidationMessage)
    }))
    
  }
  ngOnInit(): void {

    this.formUtilSvc.refData = this.data.refData;
    this.formUtilSvc.capitalTypeSubtypeAssociation = this.data.capitalTypeSubtypeAssociation;

    this.formUtilSvc.setSubtypeOptions();
    this.formUtilSvc.setDynamicOptions();
  
    this.changeListeners();
    
    this.actionType = this.formUtilSvc.actionType = this.data.actionType;
    /* Set Up Static Options */
    
    this.formUtilSvc.capitalTypeOptions = this.data.capitalTypes;
    this.formUtilSvc.capitalSubTypeOptions = this.data.capitalSubTypes;
    this.formUtilSvc.strategyOptions = this.data.strategies;

    for(let i = 0; i < this.data.refData.length; i+= 1){
      if(!!this.data.refData[i].fundHedging){
        this.formUtilSvc.fundHedgingOptions.push(this.data.refData[i].fundHedging);
      }
      if(!!this.data.refData[i].fundCcy){
        this.formUtilSvc.fundCcyOptions.push(this.data.refData[i].fundCcy);
      }
    }
    this.formUtilSvc.fundHedgingOptions = [...new Set(this.formUtilSvc.fundHedgingOptions)]
    this.formUtilSvc.fundCcyOptions = [...new Set(this.formUtilSvc.fundCcyOptions)]

    if(this.data.actionType === 'LINK-ADD'){

      this.gridData = this.data.rowData;

      let FH: string = this.data.rowData[0].fundHedging;
      let FundCcy: string = this.data.rowData[0].fundCcy;

      let ISN: string = null, narrative: string = null;

      let issuers: string[] = [...new Set(<string[]>this.data.rowData?.map(investment =><string> investment?.['issuerShortName']))];

      this.formUtilSvc.setDynamicOptions(FH, null, null); // This line sets Issuer options.

      if(issuers?.length > 1){
        narrative = issuers.join(', ');
        this.isMultipleIssuers = true;       // Hiding issuer and asset fields
      }
      else if(issuers?.length === 1){
        ISN = issuers[0];

        this.formUtilSvc.selectedIssuerID = this.data.rowData[0].issuerID;
        this.formUtilSvc.setDynamicOptions(FH, ISN, null);  // This only sets asset options.
      }


      let investmentsBaseAmount: number = -this.gridData?.map(inv => inv?.['totalBase']).reduce((total, amount) => total + amount) || 0.0;

      this.form.patchValue({
        narrative: narrative,
        capitalType: null,
        capitalSubType: null,
        strategy: null,
        fundCcy: FundCcy,
        totalAmount: investmentsBaseAmount,
        fundHedging: FH,
        issuerShortName: ISN,
        asset: null,
      })

      /* Initialises capitalAct for sending it to linking grid component */
      this.model = this.formUtilSvc.getCapitalActivityForm(this.form); 

    }
    else if(this.data.actionType === 'EDIT')
    {
      this.gridData = this.data.gridData;

      let row = this.data.rowData;
      this.formUtilSvc.selectedIssuerID = row.wsoIssuerID;  // Issuer ID for the EDIT row;
      this.formUtilSvc.selectedAssetID = row?.['wsoAssetID'];
      
      // Dynamic options for EDIT
      this.formUtilSvc.setDynamicOptions(row?.['fundHedging'], row?.['issuerShortName'], row?.['asset']);
      this.form.patchValue({
        valueDate: row?.['valueDate'],
        callDate: row?.['callDate'],
        narrative: row?.['narrative'],
        capitalType: row?.['capitalType'],
        capitalSubType: row?.['capitalSubType'],
        strategy: row?.['strategy'],
        fundCcy: row?.['fundCcy'],
        totalAmount: row?.['totalAmount'],
        fundHedging: row?.['fundHedging'],
        issuerShortName: row?.['issuerShortName'],
        asset: row?.['asset'],
      })

        /* totalAmount wasn't getting set from the above patch statement. Hence, manually setting it up */
      this.form.patchValue({totalAmount: row?.['totalAmount']})
      this.formUtilSvc.setSubtypeOptions(row?.['capitalType']);

    }
  }

  hideIssuerAndAsset(): boolean {
    return this.isMultipleIssuers || this.isNAVType;
  }
  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  issuerSelect(event: MatAutocompleteSelectedEvent){
    let ISN: string = event.option.value;
  
    /* 
      DO NOT CHANGE THE ORDER:
        1.) setDynamicOptions
        2.) observable trigger (performed by reset() action here)
      This will set the issuerSNOptions & assetOptions 
  
      Similarly for fundHedgingSelect();
    */
    this.formUtilSvc.setDynamicOptions(this.form.get('fundHedging').value, ISN, null);
  
    /* 
      Clears the asset field and triggers the observable for assetFilteredOptions via reset(). 
      NOTE: If not reseting in future, make sure to TRIGGER OBSERVABLE manually.
      
      Triggering observable makes the newly set assetOptions available to assetFilteredOptions.
    */
    this.form.get('asset').reset();
  }
  setIssuerID(ISS: [string, string, number]){
    //ISS: [Issuer + IssuerShortName, IssuerShortName, wsoIssuerID]
    this.formUtilSvc.selectedIssuerID = ISS[2];
    this.model = this.formUtilSvc.getCapitalActivityForm(this.form);   // getFormCapitalAct() on statusChanges() gets called before setting selectedIssuerID
  }
 
  setAssetID(asset: [string, number]){
    this.formUtilSvc.selectedAssetID = asset[1];
    this.model = this.formUtilSvc.getCapitalActivityForm(this.form);  // getFormCapitalAct() on statusChanges() gets called before setting selectedAssetID
  }

  /** Listening for changing the autocomplete options, based on selected values */  
  fundHedgingSelect(event: MatAutocompleteSelectedEvent){
    let FH: string = event.option.value;
    this.formUtilSvc.setDynamicOptions(FH, null, null);
    this.form.get('issuerShortName').reset();
    this.form.get('asset').reset();
    this.formUtilSvc.setFundCcy(FH, this.form);
  }
}