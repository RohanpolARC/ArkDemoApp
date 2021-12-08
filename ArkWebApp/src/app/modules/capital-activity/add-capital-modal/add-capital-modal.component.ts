import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapitalActivityModel } from 'src/app/shared/models/CapitalActivityModel';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { Subscription } from 'rxjs';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import * as moment from 'moment';
import { UpdateConfirmComponent } from '../update-confirm/update-confirm.component';
import { ValidationResult } from '@adaptabletools/adaptable/types';
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
@Component({
  selector: 'app-add-capital-modal',
  templateUrl: './add-capital-modal.component.html',
  styleUrls: ['./add-capital-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddCapitalModalComponent implements OnInit {

  capitalAct: CapitalActivityModel = null;

  subscriptions: Subscription[] = [];
  capitalTypeOptions: string[] = [];
  capitalSubTypeOptions: string[]= [];
  fundHedgingOptions = [];
  issuerOptions = []; 
  issuerSNOptions = [];
  assetOptions = [];
  fundCcyOptions = [];

  header: string;
  buttontext: string;

  isSuccessMsgAvailable: boolean;
  isFailureMsgAvailable: boolean;
  updateMsg:string;
  disableSubmit: boolean = true;
  editClicks: number;
  valueErrorMessage: string = null;

  capitalTypeFilteredOptions: Observable<string[]>;
  capitalSubTypeFilteredOptions: Observable<string[]>;
  
  fundHedgingFilteredOptions: Observable<string[]>;
  assetFilteredOptions: Observable<string[]>;
  issuerFilteredOptions: Observable<[string, string][]>;
  fundCcyFilteredOptions: Observable<string[]>;
  
  netISS: [string, string][] = []; // [ issuer, issuerShortName] []

  capitalValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let issuerShortName: string = control.get('issuerShortName').value;
    if(this.issuerSNOptions.indexOf(issuerShortName) === -1 && issuerShortName !== null && issuerShortName !== ''){
      control.get('issuerShortName').setErrors({invalid: true})
      issuerShortName = null;
    }
    else control.get('issuerShortName').setErrors(null);

    let asset: string = control.get('asset').value;
    if(this.assetOptions.indexOf(asset) === -1 && asset !== null && asset !== ''){
      control.get('asset').setErrors({invalid: true})
      asset = null;
    }
    else control.get('asset').setErrors(null);

    let narrative: string = control.get('narrative').value;

    let callDate: string = moment(control.get('callDate').value).format('YYYY-MM-DD');
    let valueDate: string = moment(control.get('valueDate').value).format('YYYY-MM-DD');
    let fundHedging: string = control.get('fundHedging').value;

    if(this.fundHedgingOptions.indexOf(fundHedging) === -1){
      control.get('fundHedging').setErrors({invalid: true})
      fundHedging = null;
    }
    else control.get('fundHedging').setErrors(null);
    
    let capitalType: string = control.get('capitalType').value;    
    if(this.capitalTypeOptions.indexOf(capitalType) === -1){
      control.get('capitalType').setErrors({invalid: true})
      capitalType = null;
    }
    else control.get('capitalType').setErrors(null);

    let capitalSubType: string = control.get('capitalSubType').value;
    if(this.capitalSubTypeOptions.indexOf(capitalSubType) === -1){
      control.get('capitalSubType').setErrors({invalid: true})
      capitalSubType = null;
    }
    else control.get('capitalSubType').setErrors(null);

    let currency: string = control.get('fundCcy').value;
    if(this.fundCcyOptions.indexOf(currency) === -1){
      control.get('fundCcy').setErrors({invalid: true})
      currency = null;
    }
    else control.get('fundCcy').setErrors(null);

    let totalAmount: number = control.get('totalAmount').value;

    let CD: boolean = (callDate !== null && callDate !== 'Invalid date')
    let VD: boolean = (valueDate !== null && valueDate !== 'Invalid date')
    let FH: boolean = (fundHedging !== null && fundHedging !== '')
    let CT: boolean = (capitalType !== null && capitalType !== '')
    let CST: boolean = (capitalSubType !== null && capitalSubType !== '')
    let CCY: boolean = (currency !== null && currency !== '')
    let TA: boolean = (totalAmount !== null) 

    let ISN: boolean = (issuerShortName !== null && issuerShortName !== '');
    let AS: boolean = (asset !== null && asset !== '');
    let NR: boolean = (narrative !== null && narrative !== '');
        
    return ((CD && VD && FH && CT && CST && CCY && TA && ((ISN && AS) || NR))) ? { validated : true }: { validated : false};
  }

  capitalActivityForm= new FormGroup({
    valueDate: new FormControl(null, Validators.required),
    callDate: new FormControl(null, Validators.required),
    narrative: new FormControl(null),
    capitalType: new FormControl(null, Validators.required),
    capitalSubType: new FormControl(null, Validators.required),
    fundCcy: new FormControl(null, Validators.required),
    totalAmount: new FormControl(null, Validators.required),
    fundHedging: new FormControl(null, Validators.required),
    issuerShortName: new FormControl(null),
    asset: new FormControl(null),
  },{
    validators: this.capitalValidator
  }
  );

  constructor(public dialogRef: MatDialogRef<AddCapitalModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private capitalActivityService: CapitalActivityService, 
    private msalService: MsalUserService) { }

  createNetISS(issuers, issuerSN){
    this.netISS = [];
    let seen = new Map();
    for(let i = 0; i < issuers.length; i+= 1){
      if(seen.has(issuers[i]) === null || seen.has(issuers[i]) === false){
        seen.set(issuers[i],true)
        this.netISS.push([issuers[i], issuerSN[i]])
      }
    }
  }

  setDynamicOptions(FH?: string, IssuerSN?: string, Asset?: string): void {
    if(FH || IssuerSN || Asset){
      if(FH && !IssuerSN && !Asset){
          /**
              Options: Get ISSUERS & ASSETS for selected FundHedging.
           */
        let issuers = []; 
        let issuerSN = [];  
        let assets = [];     
        this.data.refData.forEach(row => {
          if(row.fundHedging === FH){
            issuers.push(row.issuer);
            issuerSN.push(row.issuerShortName)
            assets.push(row.asset);
          }
        });

        this.assetOptions = [...new Set(assets)];
        this.createNetISS(issuers, issuerSN);
      }
      else if(FH && IssuerSN && !Asset){
          /**
              Options: Get ASSETS for selected FundHedging && Issuer.
           */
        let assets = [];
        this.data.refData.forEach(row => {
          if(row.fundHedging === FH && row.issuerShortName === IssuerSN){
            assets.push(row.asset);
          }
        });
        this.assetOptions = [...new Set(assets)];
      }
      else if(FH && IssuerSN && Asset){
        /** 
         * GET
         *      ISSUERS for selected FundHedging.
         *      ASSETS for selected FundHedging & Issuer.
         *       
         *  Invoked during initial load for EDIT. 
         */
        let issuers = [];  
        let issuerSN = []; 
        let assets = [];
        this.data.refData.forEach(row => {
          if(row.fundHedging === FH){
            issuers.push(row.issuer)
            issuerSN.push(row.issuerShortName)
            if(row.issuerShortName === IssuerSN)
              assets.push(row.asset);
          }
        });
        this.assetOptions = [...new Set(assets)]
        this.createNetISS(issuers, issuerSN);

      }

    }
    else{    
        /**
         *  Options: FETCH ALL OPTIONS.
         *  Invoked during initial load for ADD. 
         */
  
      for(let i = 0; i < this.data.refData.length; i+= 1){
        this.issuerOptions.push(this.data.refData[i].issuer);
        this.issuerSNOptions.push(this.data.refData[i].issuerShortName)
        this.assetOptions.push(this.data.refData[i].asset);
      }

      this.assetOptions = [...new Set(this.assetOptions)]  
      this.createNetISS(this.issuerOptions, this.issuerSNOptions);      

    }
  }   

  setCcy(FH: string): void{
    this.data.refData.forEach(row => {
      if(row.fundHedging === FH)
        this.capitalActivityForm.patchValue({
          fundCcy: row.fundCcy
        })
    });
  }

  _filterIS(value?: string): [string, string][]{
    if(value === null)
      return this.netISS; 
    const filterValue = value.toLowerCase();
    return this.netISS.filter(op => 
      op[1].toLowerCase().includes(filterValue))  // op = [issuer,issuerShortName]
  }

  _filter(options: string[], value: string): string []{
    if(value === null)
      return options;
    const filterValue = value.toLowerCase();
    return options.filter(op => op.toLowerCase().includes(filterValue));
  }
 
  changeListeners(): void{
    /** _ since statusChanges returns INVALID form even when it is valid. Hence, using custom cross field validator: `capitalValidator` */

    this.capitalActivityForm.statusChanges.subscribe(_ => {
  
      if(this.capitalActivityForm.errors?.['validated']){
        if(this.editClicks > 0 && this.data.actionType === 'EDIT')
          this.disableSubmit = true;
        else if(!this.capitalActivityForm.pristine)
          this.disableSubmit = false;     
      }
      else if(!this.capitalActivityForm.errors?.['validated'])
        this.disableSubmit = true;
    })

    /** Listening for changing the autocomplete options, based on selected values */

    this.capitalActivityForm.get('fundHedging').valueChanges.subscribe(FH => {
      this.capitalActivityForm.get('issuerShortName').reset();
      this.capitalActivityForm.get('asset').reset();
      this.setCcy(this.capitalActivityForm.get('fundHedging').value);    // Sets currency field for the selected fundHedging
      this.setDynamicOptions(FH, null, null);
    })

    this.capitalActivityForm.get('issuerShortName').valueChanges.subscribe(ISN => {
      this.capitalActivityForm.get('asset').reset();
      this.setDynamicOptions(this.capitalActivityForm.get('fundHedging').value, ISN, null);
    })    

    /** Listening for changing the autocomplete options, based on search */
    
    this.fundHedgingFilteredOptions = this.capitalActivityForm.get('fundHedging').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.fundHedgingOptions, value))
    );

    this.issuerFilteredOptions = this.capitalActivityForm.get('issuerShortName').valueChanges.pipe(
      startWith(''),
      map(value => this._filterIS(value))
    )

    this.assetFilteredOptions = this.capitalActivityForm.get('asset').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.assetOptions, value))
    )
    
    this.fundCcyFilteredOptions = this.capitalActivityForm.get('fundCcy').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.fundCcyOptions, value))
    )
      
    this.capitalTypeFilteredOptions = this.capitalActivityForm.get('capitalType').valueChanges.pipe( startWith(''), 
      map(value => this._filter(this.capitalTypeOptions, value))
    )

    this.capitalSubTypeFilteredOptions = this.capitalActivityForm.get('capitalSubType').valueChanges.pipe(startWith(''), 
      map(value => this._filter(this.capitalSubTypeOptions, value))
    )
  }
  ngOnInit(): void {
    this.setDynamicOptions();

    this.isSuccessMsgAvailable = this.isFailureMsgAvailable = false;
  
    this.editClicks = 0;

    this.changeListeners();
    this.disableSubmit = true;
    /* Set Up Static Options */
    this.capitalTypeOptions = this.data.capitalTypes;
    this.capitalSubTypeOptions = this.data.capitalSubTypes;

    for(let i = 0; i < this.data.refData.length; i+= 1){
      this.fundHedgingOptions.push(this.data.refData[i].fundHedging);
      this.fundCcyOptions.push(this.data.refData[i].fundCcy);
    }
    this.fundHedgingOptions = [...new Set(this.fundHedgingOptions)]
    this.fundCcyOptions = [...new Set(this.fundCcyOptions)]

    if(this.data.actionType === 'EDIT')
    {
      this.header = 'Edit Capital';
      this.buttontext = 'Update';

      // Dynamic options for EDIT
      this.setDynamicOptions(this.data.rowData.fundHedging, this.data.rowData.issuerShortName, this.data.rowData.asset);
      
      this.capitalActivityForm.patchValue({
        valueDate: this.data.rowData.valueDate,
        callDate: this.data.rowData.callDate,
        narrative: this.data.rowData.narrative,
        capitalType: this.data.rowData.capitalType,
        capitalSubType: this.data.rowData.capitalSubType,
        fundCcy: this.data.rowData.fundCcy,
        totalAmount: this.data.rowData.totalAmount,
        fundHedging: this.data.rowData.fundHedging,
        issuerShortName: this.data.rowData.issuerShortName,
        asset: this.data.rowData.asset
      })

    }
    else{
      this.header = 'Add Capital';
      this.buttontext = 'Submit';
        // Dynamic Options for ADD.
    }

  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  performSubmit() {
    this.isSuccessMsgAvailable = this.isFailureMsgAvailable = false;
    this.capitalAct = <CapitalActivityModel>{};
    this.disableSubmit = true;
    this.capitalAct.valueDate = this.capitalActivityForm.get('valueDate').value;
    this.capitalAct.callDate = this.capitalActivityForm.get('callDate').value;
    this.capitalAct.narrative = this.capitalActivityForm.get('narrative').value;
    this.capitalAct.capitalType = this.capitalActivityForm.get('capitalType').value;
    this.capitalAct.capitalSubType = this.capitalActivityForm.get('capitalSubType').value;
    this.capitalAct.fundCcy = this.capitalActivityForm.get('fundCcy').value;
    this.capitalAct.totalAmount = this.capitalActivityForm.get('totalAmount').value;
    this.capitalAct.fundHedging = this.capitalActivityForm.get('fundHedging').value;
    this.capitalAct.issuerShortName = this.capitalActivityForm.get('issuerShortName').value;
    this.capitalAct.asset = this.capitalActivityForm.get('asset').value;

    this.capitalAct.valueDate = new Date(moment(this.capitalAct.valueDate).format('YYYY-MM-DD'));
    this.capitalAct.callDate = new Date(moment(this.capitalAct.callDate).format('YYYY-MM-DD'));

    // Setting up audit columns.
    if(this.data.actionType === 'EDIT'){
      this.capitalAct.capitalID = this.data.rowData.capitalID;
      this.capitalAct.modifiedOn = new Date();
      this.capitalAct.modifiedBy = this.msalService.getUserName();
    }
    else{
      this.capitalAct.capitalID = null;
      this.capitalAct.createdOn = new Date();
      this.capitalAct.createdBy = this.msalService.getUserName();  
    }

    this.subscriptions.push(this.capitalActivityService.putCapitalActivity(this.capitalAct).subscribe({
      next: data => {
        this.isSuccessMsgAvailable = true;
        this.isFailureMsgAvailable = false;

        if(this.data.actionType === 'ADD'){
          if(data.data != -1)   // .data is the returned data(here, capitalID) of the newly inserted/updated row.
            this.capitalAct.capitalID = data.data;

          this.disableSubmit = true;
          this.updateMsg = 'Capital activity successfully added';
          this.data.adapTableApi.gridApi.addGridData([this.capitalAct]);

          this.capitalActivityForm.reset(); // Resets form to invalid state
  
        }
        else{
          this.editClicks += 1;
          this.disableSubmit = true;
          this.capitalActivityForm.disable();
          this.updateMsg = 'Capital activity successfully updated';
          this.data.adapTableApi.gridApi.updateGridData([this.capitalAct]);
        }

      },
      error: error => {
        this.isFailureMsgAvailable = true;
        this.isSuccessMsgAvailable = false;

        if(this.data.actionType === 'ADD')
          this.updateMsg = 'Insert failed';
        else this.updateMsg = 'Update failed';

        this.editClicks = 0;
        this.disableSubmit = false;   // To Enable submit again, if previous submit failed.

      }
    }));

  }
  onSubmit(): void {
    this.disableSubmit = true;
    if(this.data.actionType === 'EDIT'){
      const confirmDialog = this.dialog.open(UpdateConfirmComponent,{ 
        data: {
          actionType: 'EDIT'
        }});
      this.subscriptions.push(confirmDialog.afterClosed().subscribe(result => {
        if(result.action === 'Confirm'){
          this.performSubmit();
        }
        else this.disableSubmit = false;
      }));  
    }
    else if(this.data.actionType === 'ADD'){
      this.performSubmit();
    }
  }

  closeDialog(data?: CapitalActivityModel): void {
    if(this.isSuccessMsgAvailable)
      this.dialogRef.close({event:'Close with Success', data:data});
    else
      this.dialogRef.close({event:'Close', data:null});
  }
}
