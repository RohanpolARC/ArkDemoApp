import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { VPortfolioModel } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-portfolio-save-rules',
  templateUrl: './portfolio-save-rules.component.html',
  styleUrls: ['./portfolio-save-rules.component.scss']
})

export class PortfolioSaveRulesComponent implements OnInit {

  isLocal: boolean
  isAutomatic: boolean
  subscriptions: Subscription[] = []
  adaptableApi: AdaptableApi
  selectedModelName: string
  disableUpdate: boolean
  disableSubmit: boolean
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
  modelForm: FormGroup
  
  constructor(
    public dialogRef: MatDialogRef<PortfolioSaveRulesComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private dataService: DataService,
    private irrCalcService: IRRCalcService
  ) { }

  modelValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let RN: boolean = !!control.get('modelName').value
    let RD: boolean = !!control.get('modelDesc').value
    return (RN && RD) ? { validated: true } : { validated: false }
  }
  
  ngOnInit(): void {
    this.Init();
    this.changeListeners();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  Init(){
    this.isAutomatic = this.data.isAutomatic
    this.isLocal = this.data.isLocal
    this.disableSubmit = false;
    this.isSuccess = this.isFailure = false;
    this.adaptableApi = this.data.adaptableApi;
    this.selectedModelName = this.data.model?.modelName;
    this.asOfDate = this.data.asOfDate;
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

    if(this.isAutomatic){
      this.rules = JSON.parse(JSON.stringify(this.adaptableApi.filterApi.getAllColumnFilter()))
      this.recursiveRemoveKey(this.rules, 'Uuid')
      this.recursiveRemoveKey(this.rules, 'Source')  
    }
    else{
      this.positionIDs = this.data.positionIDs
    }

    this.modelForm = new FormGroup({
      modelName: new FormControl(this.data.model?.modelName, Validators.required),
      modelDesc: new FormControl(this.data.model?.modelDesc, Validators.required),
      isUpdate: new FormControl(!!this.modelID, Validators.required)
    },{
      validators: this.modelValidator
    })

  }

  changeListeners(){
    this.subscriptions.push(this.modelForm.valueChanges.subscribe(_ => {
      if(this.modelForm.errors?.['validated'] && !this.isSuccess && (this.rules?.length > 0 || this.positionIDs?.length > 0)){
        this.disableSubmit = false;
      }
      else if(!this.modelForm.errors?.['validated']){
        this.disableSubmit = true;
      }
    }))

    this.subscriptions.push(this.modelForm.get('isUpdate').valueChanges.subscribe(isUpdate => {
      if(isUpdate === false){
        this.modelForm.get('modelName').reset()
        this.modelForm.get('modelDesc').reset()
      }
    }))
  }

  onProceed(){
    let model: VPortfolioModel = <VPortfolioModel> {};
    model.modelName = this.modelForm.get('modelName').value;
    model.modelDesc = this.modelForm.get('modelDesc').value;
    model.username = this.dataService.getCurrentUserName();
    model.modelID = (this.modelForm.get('isUpdate').value) ? this.modelID : null;
    model.isLocal = this.isLocal;
    model.isManual = !this.isAutomatic;

    if(this.isAutomatic){
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
    this.subscriptions.push(this.irrCalcService.putPortfolioModels(model).subscribe({
      next: result => {
        if(result.isSuccess){
          this.isSuccess = true
          this.isFailure = false
          this.updateMsg = 'Successfully updated model';
          this.disableSubmit = true

          /*Updating ruleID for inserted rule*/
          if(!this.modelForm.get('isUpdate').value){
            // 0th result has inserted key, 1st result has updated key, if any, else they are 0
            this.modelID = result.data[0].value;
          }

          if(this.data.context === 'Save&Run'){
            this.dialogRef.close();
          }
        }
        else{
          this.isSuccess = false
          this.isFailure = true
          this.updateMsg = 'Failed to update model';
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
  
  recursiveRemoveKey = (object, deleteKey) => {
    delete object[deleteKey];
    
    Object.values(object).forEach((val) => { 
      if (typeof val !== 'object') return;
      
      this.recursiveRemoveKey(val, deleteKey);
    })
  }

  onClose(){
    this.dialogRef.close({ isSuccess: this.isSuccess})
  }
}
