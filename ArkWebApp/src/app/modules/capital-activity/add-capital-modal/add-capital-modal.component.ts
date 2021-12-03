import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapitalActivityModel } from 'src/app/shared/models/CapitalActivityModel';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { Subscription } from 'rxjs';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import * as moment from 'moment';

@Component({
  selector: 'app-add-capital-modal',
  templateUrl: './add-capital-modal.component.html',
  styleUrls: ['./add-capital-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddCapitalModalComponent implements OnInit {

  capitalAct: CapitalActivityModel = null;

  subscriptions: Subscription[] = [];
  capitalTypeOptions = [
    { type: 'Distribution' }, 
    { type: 'Contribution' },
  ];
  capitalSubTypeOptions = [
    { subtype: 'Income' }, 
    { subtype: 'Investment' },
  ];
  fundHedgingOptions = [
    { name: 'EUR-UNLEV' }, 
    { name: 'USD-UNLEV' },
  ];

  header: string;
  buttontext: string;

  isSuccessMsgAvailable: boolean;
  isFailureMsgAvailable: boolean;
  updateMsg:string;
  actionfailed: boolean;
  

  capitalActivityForm = new FormGroup({
    valueDate: new FormControl(null, Validators.required),
    callDate: new FormControl(null, Validators.required),
    narrative: new FormControl(null),
    capitalType: new FormControl(null, Validators.required),
    capitalSubType: new FormControl(null, Validators.required),
    totalAmount: new FormControl(null, Validators.required),
    fundHedging: new FormControl(null, Validators.required),
    issuer: new FormControl(null, Validators.required),
    asset: new FormControl(null, Validators.required),
  },
  );

  constructor(public dialogRef: MatDialogRef<AddCapitalModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,
    private capitalActivityService: CapitalActivityService, private msalService: MsalUserService) { }

  ngOnInit(): void {
    if(this.data.actionType === 'EDIT')
    {
      this.header = 'Edit Capital';
      this.buttontext = 'Update';

      this.capitalActivityForm.patchValue({
        valueDate: this.data.rowData.valueDate,
        callDate: this.data.rowData.callDate,
        narrative: this.data.rowData.narrative,
        capitalType: this.data.rowData.capitalType,
        capitalSubType: this.data.rowData.capitalSubType,
        totalAmount: this.data.rowData.totalAmount,
        fundHedging: this.data.rowData.fundHedging,
        issuer: this.data.rowData.issuer,
        asset: this.data.rowData.asset
      })
    }
    else{
      this.header = 'Add Capital';
      this.buttontext = 'Submit';
    }

    this.isSuccessMsgAvailable = this.isFailureMsgAvailable = false;
    this.actionfailed = false;

    this.capitalActivityForm.statusChanges.subscribe(validity => {
      if(validity === 'VALID'){
        if(this.data.actionType === 'EDIT')
        this.actionfailed = true;
       
      }
      console.log(validity);
    })

  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


  onSubmit(): void {
    if(!this.capitalActivityForm.valid){
      return;
    }

    this.capitalAct = <CapitalActivityModel>{};

    this.capitalAct.valueDate = this.capitalActivityForm.get('valueDate').value;
    this.capitalAct.callDate = this.capitalActivityForm.get('callDate').value;
    this.capitalAct.narrative = this.capitalActivityForm.get('narrative').value;
    this.capitalAct.capitalType = this.capitalActivityForm.get('capitalType').value;
    this.capitalAct.capitalSubType = this.capitalActivityForm.get('capitalSubType').value;
    this.capitalAct.totalAmount = this.capitalActivityForm.get('totalAmount').value;
    this.capitalAct.fundHedging = this.capitalActivityForm.get('fundHedging').value;
    this.capitalAct.issuer = this.capitalActivityForm.get('issuer').value;
    this.capitalAct.asset = this.capitalActivityForm.get('asset').value;

    this.capitalAct.valueDate = new Date(moment(this.capitalAct.valueDate).format('YYYY-MM-DD'));
    this.capitalAct.callDate = new Date(moment(this.capitalAct.callDate).format('YYYY-MM-DD'));

    console.log(this.capitalAct);
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

        if(this.data.actionType === 'ADD')
          this.updateMsg = 'Capital activity successfully added';
        else this.updateMsg = 'Capital activity updated';
        console.log('Capital Activity Added');
        

        if(this.data.actionType === 'ADD'){
          this.data.adapTableApi.gridApi.addGridData([this.capitalAct]);

          this.capitalActivityForm.reset();

          /** Clears the error state (red highlight) of fields on form reset */

          Object.keys(this.capitalActivityForm.controls).forEach(key =>{
            this.capitalActivityForm.controls[key].setErrors(null)
          });
  
        }
        else{
          this.data.adapTableApi.gridApi.updateGridData([this.capitalAct]);
        }

        setTimeout(() => {
          this.isSuccessMsgAvailable = false;
        }, 10000)

        this.actionfailed = false;
      },
      error: error => {
        this.isFailureMsgAvailable = true;
        this.isSuccessMsgAvailable = false;

        if(this.data.actionType === 'ADD')
          this.updateMsg = 'Insert failed';
        else this.updateMsg = 'Update failed';

        console.log('Capital Activity Failed');

        this.actionfailed = true;   // To Enable submit again, if previous submit failed.

      }
    }));

  }

  closeDialog(data?: CapitalActivityModel): void {
    if(this.isSuccessMsgAvailable)
      this.dialogRef.close({event:'Close with Success', data:data});
    else
      this.dialogRef.close({event:'Close', data:null});
  }
}
