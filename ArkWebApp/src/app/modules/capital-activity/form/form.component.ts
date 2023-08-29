import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapitalActivityModel, CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { startWith, map, tap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { ModalService } from '../services/modal.service';
import { FormUtilService } from '../services/form-util.service';

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
      capitalTypeSubtypeAssociation: any,
      refData: any,
      gridData: any
    },
    public dialog: MatDialog,
    private modalSvc: ModalService) { }
  model: CapitalActivityModel = <CapitalActivityModel>{};

  subscriptions: Subscription[] = [];

  capitalTypeFilteredOptions: Observable<string[]>;
  capitalSubTypeFilteredOptions: Observable<string[]>;
  fundHedgingFilteredOptions: Observable<string[]>;
  assetFilteredOptions: Observable<[string, number][]>;
  issuerFilteredOptions: Observable<[string, string, number][]>;
  fundCcyFilteredOptions: Observable<string[]>;
  posCcyFilteredOptions: Observable<string[]>;
  actionType: 'LINK-ADD' | 'ADD' | 'EDIT'
  gridData: any[] = [];  
  hideNonNAVFields: boolean;

  form = new FormGroup({
    valueDate: new FormControl(null, Validators.required),
    callDate: new FormControl(null, Validators.required),
    narrative: new FormControl(null),
    capitalType: new FormControl(null, Validators.required),
    capitalSubType: new FormControl(null, Validators.required),
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
    
    this.fundCcyFilteredOptions = this.form.get('fundCcy').valueChanges.pipe(
      startWith(''),
      map(value => this.formUtilSvc._filter(this.formUtilSvc.fundCcyOptions, value))
    )

    this.capitalTypeFilteredOptions = this.form.get('capitalType').valueChanges.pipe( 
      startWith(''), 
      tap((capitalType: any) => {

        this.formUtilSvc.setSubtypeOptions(capitalType);
        if(!this.formUtilSvc.capitalSubTypeOptions.includes(this.form.get('capitalSubType').value)){
          this.form.get('capitalSubType').reset();
        }
        if(capitalType === 'NAV'){
          this.form.get('issuerShortName').reset();
          this.form.get('asset').reset();

          this.hideNonNAVFields = true;
        }
        else 
          this.hideNonNAVFields = false;
      }),
      map(value => this.formUtilSvc._filter(this.formUtilSvc.capitalTypeOptions, value)),

    )

    this.capitalSubTypeFilteredOptions = this.form.get('capitalSubType').valueChanges.pipe(startWith(''), 
      map(value => this.formUtilSvc._filterCapitalSubtype(value))
    )
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
      let ISN: string = this.data.rowData[0].issuerShortName;
      let FundCcy: string = this.data.rowData[0].fundCcy;

      this.formUtilSvc.selectedIssuerID = this.data.rowData[0].issuerID;
      this.formUtilSvc.setDynamicOptions(FH, null, null); // This line sets Issuer options.
      this.formUtilSvc.setDynamicOptions(FH, ISN, null);  // This only sets asset options.

      let investmentsBaseAmount: number = this.gridData?.map(inv => inv?.['totalBase']).reduce((total, amount) => total + amount) || 0.0;

      this.form.patchValue({
        narrative: null,
        capitalType: null,
        capitalSubType: null,
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

      this.formUtilSvc.selectedIssuerID = this.data.rowData.wsoIssuerID;  // Issuer ID for the EDIT row;
      this.formUtilSvc.selectedAssetID = this.data.rowData.wsoAssetID;
      
      // Dynamic options for EDIT
      this.formUtilSvc.setDynamicOptions(this.data.rowData.fundHedging, this.data.rowData.issuerShortName, this.data.rowData.asset);
      this.form.patchValue({
        valueDate: this.data.rowData.valueDate,
        callDate: this.data.rowData.callDate,
        narrative: this.data.rowData.narrative,
        capitalType: this.data.rowData.capitalType,
        capitalSubType: this.data.rowData.capitalSubType,
        fundCcy: this.data.rowData.fundCcy,
        totalAmount: this.data.rowData.totalAmount,
        fundHedging: this.data.rowData.fundHedging,
        issuerShortName: this.data.rowData.issuerShortName,
        asset: this.data.rowData.asset,
      })

        /* totalAmount wasn't getting set from the above patch statement. Hence, manually setting it up */
      this.form.patchValue({totalAmount: this.data.rowData.totalAmount})
      this.formUtilSvc.setSubtypeOptions(this.data.rowData.capitalType);
      
    }
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