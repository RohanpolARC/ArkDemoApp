import { AdaptableApi } from '@adaptabletools/adaptable-angular-aggrid';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/app/core/services/data.service';
import { RefDataManagerService } from 'src/app/core/services/RefDataManager/ref-data-manager.service';
import { AttributeFixingTypeModel } from 'src/app/shared/models/AttributesFixingModel';

type ACTION_TYPE = 'ADD' | 'EDIT';

@Component({
  selector: 'app-add-ref-data-form',
  templateUrl: './add-ref-data-form.component.html',
  styleUrls: ['./add-ref-data-form.component.scss']
})
export class AddRefDataFormComponent implements OnInit {
  adaptableApi: AdaptableApi;
  form: FormGroup;
  isSuccess: boolean;
  isFailure: boolean;
  updateMsg: string;
  types: string[] 

  constructor(
    private dataSvc: DataService,
    private refDataManagerSvc: RefDataManagerService,
    public dialogRef: MatDialogRef<AddRefDataFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      action: ACTION_TYPE,
      fixingType: any,
      adaptableApi: AdaptableApi
    }
  ) { }

  ngOnInit(): void {
    this.adaptableApi = this.data.adaptableApi;
    this.types = [
      'Decimal',
      'Boolean',
      'Date',
      'Integer',
      'String'
    ]
    this.initForm()
  }

  initForm(){
    this.form = new FormGroup({
      attributeName: new FormControl(null, Validators.required),
      attributeLevel: new FormControl(null, Validators.required),
      attributeType: new FormControl(null, Validators.required)
    })
  }


  onSubmit(){
    let model = <AttributeFixingTypeModel>{}
    
    model.attributeName = this.form.value.attributeName;
    model.attributeLevel = this.form.value.attributeLevel;
    model.attributeType = this.form.value.attributeType;
    model.modifiedBy = this.dataSvc.getCurrentUserName();

    this.refDataManagerSvc.putRefDataFixingTypes(model).subscribe({
      next: (result: any) => {
        if(result.isSuccess){
          this.isSuccess = true;
          this.isFailure = false;
          this.updateMsg = 'Successfully updated fixing types';

          let r = { ...this.data.fixingType }
          r.attributeName = this.form.value.attributeName;
          r.attributeLevel = this.form.value.attributeLevel;
          r.attributeType = this.form.value.attributeType;
          r.modifiedBy = this.dataSvc.getCurrentUserName();
          r.modifiedOn = new Date();

          if(this.data.action === 'EDIT'){
            this.adaptableApi.gridApi.updateGridData([r])
          }
          else if(this.data.action === 'ADD'){
            r.attributeId = result.data
            r.createdBy = r.modifiedBy
            r.createdOn = r.modifiedOn
            this.adaptableApi.gridApi.addGridData([r])
          }
        }
        else{
            this.isFailure = true;
            this.isSuccess = false;
            this.updateMsg = 'Failed to update fixing details'
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
