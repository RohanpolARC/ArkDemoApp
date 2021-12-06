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

@Component({
  selector: 'app-add-capital-modal',
  templateUrl: './add-capital-modal.component.html',
  styleUrls: ['./add-capital-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddCapitalModalComponent implements OnInit {

  capitalAct: CapitalActivityModel = null;

  subscriptions: Subscription[] = [];
  capitalTypeOptions: {type: string}[] = [];
  capitalSubTypeOptions: {subtype: string}[]= [];
  fundHedgingOptions = [];
  issuerOptions = [];
  assetOptions = [];
  fundCcyOptions = [];

  header: string;
  buttontext: string;

  isSuccessMsgAvailable: boolean;
  isFailureMsgAvailable: boolean;
  updateMsg:string;
  disableSubmit: boolean;

  capitalActivityForm = new FormGroup({
    valueDate: new FormControl(null, Validators.required),
    callDate: new FormControl(null, Validators.required),
    narrative: new FormControl(null),
    capitalType: new FormControl(null, Validators.required),
    capitalSubType: new FormControl(null, Validators.required),
    fundCcy: new FormControl(null, Validators.required),
    totalAmount: new FormControl(null, Validators.required),
    fundHedging: new FormControl(null, Validators.required),
    issuer: new FormControl(null, Validators.required),
    asset: new FormControl(null, Validators.required),
  },
  );

  constructor(public dialogRef: MatDialogRef<AddCapitalModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private capitalActivityService: CapitalActivityService, 
    private msalService: MsalUserService) { }

  getUniqueOptions(options: any[], givenkey: string, resultkey: string): any[]{
    let list = [];
    let map = new Map();
    options.forEach(x => {
      if(!map.has(x[givenkey]) && x[givenkey])
        map.set(x[givenkey], true);
    })
    for(const [key, val] of map.entries()){
      let obj = {};
      obj[resultkey] = key;
      list.push(obj);
    }
    return list;
  }

  setDynamicOptions(FH?: string, Issuer?: string, Asset?: string): void {
    if(FH || Issuer || Asset){
      if(FH && !Issuer && !Asset){
          /**
              Options: Get ISSUERS & ASSETS for selected FundHedging.
           */
        let issuers = [];   
        let assets = [];     
        this.data.refData.forEach(row => {
          if(row.fundHedging === FH){
            issuers.push({issuer: row.issuer});
            assets.push({asset: row.asset});
          }
        });
        this.issuerOptions = this.getUniqueOptions(issuers, 'issuer', 'issuer');
        this.assetOptions = this.getUniqueOptions(assets, 'asset', 'asset');
      }
      else if(FH && Issuer && !Asset){
          /**
              Options: Get ASSETS for selected FundHedging && Issuer.
           */
        let assets = [];
        this.data.refData.forEach(row => {
          if(row.fundHedging === FH && row.issuer === Issuer){
            assets.push({asset: row.asset});
          }
        });
        this.assetOptions = this.getUniqueOptions(assets, 'asset', 'asset');
      }
      else if(FH && Issuer && Asset){
        /** 
         * GET
         *      ISSUERS for selected FundHedging.
         *      ASSETS for selected FundHedging & Issuer.
         *       
         *  Invoked during initial load for EDIT. 
         */
        let issuers = [];   
        let assets = [];
        this.data.refData.forEach(row => {
          if(row.fundHedging === FH){
            issuers.push({issuer: row.issuer})
            if(row.issuer === Issuer)
              assets.push({asset: row.asset});
          }
        });
        this.issuerOptions = this.getUniqueOptions(issuers, 'issuer', 'issuer');
        this.assetOptions = this.getUniqueOptions(assets, 'asset', 'asset');

      }

    }
    else{    
        /**
         *  Options: FETCH ALL OPTIONS.
         *  Invoked during initial load for ADD. 
         */
  
      for(let i = 0; i < this.data.refData.length; i+= 1){
        this.issuerOptions.push({issuer: this.data.refData[i].issuer});
        this.assetOptions.push({asset: this.data.refData[i].asset});
      }

      this.issuerOptions = this.getUniqueOptions(this.issuerOptions, 'issuer', 'issuer');
      this.assetOptions = this.getUniqueOptions(this.assetOptions, 'asset', 'asset');
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

  changeListeners(): void{
    this.capitalActivityForm.statusChanges.subscribe(validity => {
      if(validity === 'VALID' && this.disableSubmit === true){
        this.disableSubmit = false;     
      }
    })

    this.capitalActivityForm.get('fundHedging').valueChanges.subscribe(FH => {
      this.capitalActivityForm.get('issuer').reset();
      this.capitalActivityForm.get('asset').reset();
      this.setCcy(this.capitalActivityForm.get('fundHedging').value);    // Sets currency field for the selected fundHedging
      this.setDynamicOptions(FH, null, null);
    })

    this.capitalActivityForm.get('issuer').valueChanges.subscribe(ISS => {
      this.capitalActivityForm.get('asset').reset();
      this.setDynamicOptions(this.capitalActivityForm.get('fundHedging').value, ISS, null);
    })    

  }

  ngOnInit(): void {

    /* Set Up Static Options */
    this.capitalTypeOptions = this.data.capitalTypes;
    this.capitalSubTypeOptions = this.data.capitalSubTypes;

    for(let i = 0; i < this.data.refData.length; i+= 1){
      this.fundHedgingOptions.push({name: this.data.refData[i].fundHedging});
      this.fundCcyOptions.push({fundCcy: this.data.refData[i].fundCcy});
    }
    this.fundHedgingOptions = this.getUniqueOptions(this.fundHedgingOptions
      , 'name', 'name');
    this.fundCcyOptions = this.getUniqueOptions(this.fundCcyOptions, 'fundCcy', 'fundCcy')

    this.setDynamicOptions();

    if(this.data.actionType === 'EDIT')
    {
      this.header = 'Edit Capital';
      this.buttontext = 'Update';

      // Dynamic options for EDIT
      this.setDynamicOptions(this.data.rowData.fundHedging, this.data.rowData.issuer, this.data.rowData.asset);
      
      this.capitalActivityForm.patchValue({
        valueDate: this.data.rowData.valueDate,
        callDate: this.data.rowData.callDate,
        narrative: this.data.rowData.narrative,
        capitalType: this.data.rowData.capitalType,
        capitalSubType: this.data.rowData.capitalSubType,
        fundCcy: this.data.rowData.fundCcy,
        totalAmount: this.data.rowData.totalAmount,
        fundHedging: this.data.rowData.fundHedging,
        issuer: this.data.rowData.issuer,
        asset: this.data.rowData.asset
      })
    }
    else{
      this.header = 'Add Capital';
      this.buttontext = 'Submit';
        // Dynamic Options for ADD.
    }

    this.isSuccessMsgAvailable = this.isFailureMsgAvailable = false;
    this.disableSubmit = true;

    this.changeListeners();

  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


  performSubmit() {
    this.capitalAct = <CapitalActivityModel>{};

    this.capitalAct.valueDate = this.capitalActivityForm.get('valueDate').value;
    this.capitalAct.callDate = this.capitalActivityForm.get('callDate').value;
    this.capitalAct.narrative = this.capitalActivityForm.get('narrative').value;
    this.capitalAct.capitalType = this.capitalActivityForm.get('capitalType').value;
    this.capitalAct.capitalSubType = this.capitalActivityForm.get('capitalSubType').value;
    this.capitalAct.fundCcy = this.capitalActivityForm.get('fundCcy').value;
    this.capitalAct.totalAmount = this.capitalActivityForm.get('totalAmount').value;
    this.capitalAct.fundHedging = this.capitalActivityForm.get('fundHedging').value;
    this.capitalAct.issuer = this.capitalActivityForm.get('issuer').value;
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

        this.disableSubmit = false;   // To Enable submit again, if previous submit failed.

      }
    }));

  }
  onSubmit(): void {
    if(!this.capitalActivityForm.valid){
      return;
    }

    if(this.data.actionType === 'EDIT'){
      const confirmDialog = this.dialog.open(UpdateConfirmComponent,{ 
        data: {
          actionType: 'EDIT'
        }});
      this.subscriptions.push(confirmDialog.afterClosed().subscribe(result => {
        if(result.action === 'Confirm'){
          this.performSubmit();
        }
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
