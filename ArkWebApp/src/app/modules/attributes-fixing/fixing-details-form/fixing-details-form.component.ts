import { Component, OnInit, Inject } from '@angular/core';
import { AttributesFixingService } from 'src/app/core/services/AttributesFixing/attributes-fixing.service';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { forkJoin } from 'rxjs';


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
  fixingRef: any;
  attrNames: string[]
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
    // this.dataSvc.getUniqueValuesForField('fund').subscribe(data=>{
    //   //console.log(data)
    //   this.fundValues = data.map(r=>r.value)
    //   console.log(this.fundValues)
    // })
    // this.dataSvc.getUniqueValuesForField('fundHedging').subscribe(data=>{
    //   //console.log(data)
    //   this.fundHedgingValues = data.map(r=>r.value)
    //   console.log(this.fundHedgingValues)
    // })

    console.log(this.data)
    forkJoin([
      this.dataSvc.getUniqueValuesForField('fund'),
      this.dataSvc.getUniqueValuesForField('fundHedging'),
      this.attributesFixingSvc.getFixingTypes()
    ]).subscribe({
      next: (result) => {
        console.log(result)
        this.fundValues =  result[0].map(r=>r.value)
        this.fundHedgingValues = result[1].map(r=>r.value)
        console.log(result[2])
        this.fixingRef = result[2]
        this.setAttributeNames();

        this.initForm();
      },
      error: (error) => {

      }
    })

    // this.initForm();

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
    this.updateForm();
  }

  changeListeners(){
    this.form.get("attributeLevel").valueChanges.subscribe(level=>{
      if(level=="Fund"){
        this.levelValues = this.fundValues
      }else if(level=="FundHedging"){
        this.levelValues = this.fundHedgingValues
      }
    })

    this.form.get('attributeName').valueChanges.subscribe(attributeName => {
      let r = this.fixingRef.filter(r => r?.['attributeName'] === attributeName)[0];
      this.attributeType = r?.['attributeType']
      
      if(attributeName === this.data.fixingDetails.attributeName){
        this.form.patchValue({ attributeValue: this.data.fixingDetails.attributeValue})
      }
      else this.form.get('attributeValue').reset();
      
      // alert(this.attributeType)
    })

    // this.form.get("attributeType").valueChanges.subscribe(newAttributeType=>{
    //   this.attributeType = newAttributeType
    // })
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
