import { Component, OnInit, Inject } from '@angular/core';
import { AttributesFixingService } from 'src/app/core/services/AttributesFixing/attributes-fixing.service';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { forkJoin } from 'rxjs';
import { AttributeFixingModel } from 'src/app/shared/models/AttributesFixingModel';
import { getMomentDate } from 'src/app/shared/functions/utilities';


type ACTION_TYPE = 'ADD' | 'EDIT';



@Component({
  selector: 'app-fixing-details-form',
  templateUrl: './fixing-details-form.component.html',
  styleUrls: ['./fixing-details-form.component.scss']
})
export class FixingDetailsFormComponent implements OnInit {

  form: FormGroup
  fixingRef: any;
  attrNames: string[]
  attrDataTypes: string[] = ['Boolean','Decimal','Integer','Date','String']
  fundValues: string[] = []
  fundHedgingValues: string[] = []
  levelValues: string[];
  adaptableApi: AdaptableApi
  attributeType: any;
  isFailure: boolean;
  isSuccess: boolean;
  updateMsg: string;
  readOnly: boolean = false;

  constructor(
    private attributesFixingSvc: AttributesFixingService,
    private dataSvc: DataService,
    public dialogRef: MatDialogRef<FixingDetailsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      action: ACTION_TYPE,
      fixingDetails: any,
      adaptableApi: AdaptableApi
    },
  ) { }

  ngOnInit(): void {

    if(this.data.action === 'EDIT')
      this.readOnly = true
    else
      this.readOnly = false

    this.adaptableApi = this.data.adaptableApi;

    forkJoin([
      this.dataSvc.getUniqueValuesForField('fund'),
      this.dataSvc.getUniqueValuesForField('fundHedging'),
      this.attributesFixingSvc.getFixingTypes()
    ]).subscribe({
      next: (result) => {

        this.fundValues =  result[0].map(r=>r.value)
        this.fundHedgingValues = result[1].map(r=>r.value)
        this.fixingRef = result[2]
        this.setAttributeNames();
        this.initForm();
      },
      error: (error) => {
      }
    })
  }

  setAttributeNames(){
    this.attrNames = this.fixingRef.map(r => r?.['attributeName'])
  }

  updateForm(){
    this.form.patchValue({
      asOfDate: this.data.fixingDetails.asOfDate,
      attributeName: this.data.fixingDetails.attributeName,
      attributeLevel: this.data.fixingDetails.attributeLevel,
      attributeLevelValue: this.data.fixingDetails.attributeLevelValue,
      attributeType: this.data.fixingDetails.attributeType,
      attributeValue: this.data.fixingDetails.attributeValue
    })
  }

  initForm(){
    this.attributeType= this.data.fixingDetails.attributeType
    this.form = new FormGroup({
      asOfDate:new FormControl(null, Validators.required),
      attributeName: new FormControl(null, Validators.required),
      attributeLevel: new FormControl(null, Validators.required),
      attributeLevelValue: new FormControl(null, Validators.required),
      attributeType: new FormControl(null, Validators.required),
      attributeValue: new FormControl(null, Validators.required)
    })

    this.changeListeners();
    if(this.data.action === 'EDIT')
      this.updateForm();
  }

  changeListeners(){
    this.form.get("attributeLevel").valueChanges.subscribe(level=>{
      if(level=="Fund"){
        this.levelValues = this.fundValues
      }else if(level=="Fund Hedging"){
        this.levelValues = this.fundHedgingValues
      }
    })

    this.form.get('attributeName').valueChanges.subscribe(attributeName => {
      let r = this.fixingRef.filter(r => r?.['attributeName'] === attributeName)[0];
      this.attributeType = r?.['attributeType']
      
      this.form.patchValue({
        attributeLevel: r['attributeLevel'],
        attributeType: r['attributeType']
      });
      
      if(attributeName === this.data.fixingDetails.attributeName){
        this.form.patchValue({ attributeValue: this.data.fixingDetails.attributeValue, 
          attributeLevelValue: this.data.fixingDetails.attributeLevelValue})
      }
      else {
        this.form.get('attributeValue').reset();
        this.form.get('attributeLevelValue').reset();
      }

      if(this.data.action === 'ADD'){
        this.form.patchValue({ attributeLevel: r?.['attributeLevel'] })
      }

    })
  }

  onSubmit(){
    let model = <AttributeFixingModel>{}
    
    model.fixingID = (this.data.action === 'EDIT') ? this.data.fixingDetails.fixingID : null;
    model.asOfDate = getMomentDate(this.form.value.asOfDate);
    model.attributeName = this.form.value.attributeName;
    model.attributeLevel = this.form.value.attributeLevel;
    model.attributeLevelValue = this.form.value.attributeLevelValue;
    model.attributeType = this.form.value.attributeType;
    if(model.attributeType == "Boolean")
      model.attributeValue = (this.form.value.attributeValue=="Yes") ? true : false
    else if (model.attributeType == "Date")
      model.attributeValue = getMomentDate(this.form.value.attributeValue)
    else
      model.attributeValue = this.form.value.attributeValue
    model.modifiedBy = this.dataSvc.getCurrentUserName();

    this.attributesFixingSvc.putFixingDetails(model).subscribe({
      next: (result: any) => {
        if(result.isSuccess){
          this.isSuccess = true;
          this.isFailure = false;
          this.updateMsg = 'Successfully updated fixing details';

          let r = { ...this.data.fixingDetails }
          r.asOfDate = this.form.value.asOfDate;
          r.attributeName = this.form.value.attributeName;
          r.attributeLevel = this.form.value.attributeLevel;
          r.attributeLevelValue = this.form.value.attributeLevelValue;
          r.attributeType = this.form.value.attributeType;
          r.attributeValue = this.form.value.attributeValue;
          r.attributeId = this.fixingRef.filter(r => r?.['attributeName'] === r.attributeName)[0]?.['attributeId'];
          r.modifiedBy = this.dataSvc.getCurrentUserName();
          r.modifiedOn = new Date();

          if(this.data.action === 'EDIT'){
            this.adaptableApi.gridApi.updateGridData([r])
          }
          else if(this.data.action === 'ADD'){
            r.fixingID = result.data
            r.createdBy = r.modifiedBy
            r.createdOn = r.modifiedOn

            this.adaptableApi.gridApi.addGridData([r])
          }
        }
        else{
          if(result.returnMessage === 'Already exists on ADD'){
            this.isFailure = true;
            this.isSuccess = false;
            this.updateMsg = `This As Of Date, Attribute Name and ${model.attributeLevel} already exists`
          }
        }
      },
      error: (error) => {
        this.isSuccess = false;
        this.isFailure = true;
        this.updateMsg = 'Failed to update fixing details';
      }
    })
  }

  onCancel(){
    this.dialogRef.close();
  }

}
