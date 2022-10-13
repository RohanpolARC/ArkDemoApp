import { Component, OnInit, Inject } from '@angular/core';
import { AttributesFixingService } from 'src/app/core/services/AttributesFixing/attributes-fixing.service';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';


type ACTION_TYPE = 'ADD' | 'EDIT';

interface UniqueValues{
  id:number,
  value:string
} 

@Component({
  selector: 'app-fixing-details-form',
  templateUrl: './fixing-details-form.component.html',
  styleUrls: ['./fixing-details-form.component.scss']
})
export class FixingDetailsFormComponent implements OnInit {

  form: FormGroup
  attrNames: string[] = ['a','b']
  attrDataTypes: string[] = ['Boolean','Decimal','Integer','Date','String']
  fundValues: string[] = []
  fundHedgingValues: string[] = []
  levelValues: string[];
  adaptableApi: AdaptableApi
  attributeType: any;

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
    // this.attributesFixingSvc.getFixingDetails().subscribe(data=>{
    //   console.log(data.
    // }
    // )
    this.dataSvc.getUniqueValuesForField('fund').subscribe(data=>{
      //console.log(data)
      this.fundValues = data.map(r=>r.value)
      console.log(this.fundValues)
    })
    this.dataSvc.getUniqueValuesForField('fundHedging').subscribe(data=>{
      //console.log(data)
      this.fundHedgingValues = data.map(r=>r.value)
      console.log(this.fundHedgingValues)
    })
    this.initForm();

  }

  setAttributeNames(attributeLevel:string){
  }

  initForm(){
    this.attributeType= this.data.fixingDetails.attributeType
    this.setAttributeNames(this.data.fixingDetails.attributeLevel)
    this.form = new FormGroup({
      asOfDate:new FormControl(this.data.fixingDetails.asOfDate,Validators.required),
      attributeName: new FormControl(this.data.fixingDetails.attributeName,Validators.required),
      attributeLevel: new FormControl(this.data.fixingDetails.attributeLevel,Validators.required),
      attributeLevelValue: new FormControl(this.data.fixingDetails.attributeLevelValue,Validators.required),
      attributeType: new FormControl(this.data.fixingDetails.attributeType,Validators.required),
      attributeValue: new FormControl(this.data.fixingDetails.attributeValue,Validators.required)
    })
    this.form.get("attributeLevel").valueChanges.subscribe(level=>{
      if(level=="Fund"){
        this.levelValues = this.fundValues
      }else if(level=="FundHedging"){
        this.levelValues = this.fundHedgingValues
      }
    })
    this.form.get("attributeType").valueChanges.subscribe(newAttributeType=>{
      this.attributeType = newAttributeType
    })
  }

  onSubmit(){
    //If success,
    console.log("submit")
    let row = this.data.fixingDetails
    this.form.valueChanges.subscribe(changedValues=>{
      row = changedValues;
      console.log(row);

    })
    // this.adaptableApi.gridApi.updateGridData([row])
    // this.adaptableApi.gridApi.addGridData([row])
    

  }

  onCancel(){
    this.dialogRef.close();
  }

}
