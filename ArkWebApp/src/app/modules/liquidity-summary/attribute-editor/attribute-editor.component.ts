import { Component, OnInit, Inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';
import { LiquiditySummaryAttributeModel } from '../../../shared/models/LiquiditySummaryModel';
import { LiquiditySummaryService } from 'src/app/core/services/LiquiditySummary/liquidity-summary.service';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';
import { DataService } from 'src/app/core/services/data.service';
import { ConfirmPopupComponent } from 'src/app/shared/modules/confirmation/confirm-popup/confirm-popup.component';

@Component({
  selector: 'app-attribute-editor',
  templateUrl: './attribute-editor.component.html',
  styleUrls: ['./attribute-editor.component.scss']
})
export class AttributeEditorComponent implements OnInit {

  subscriptions: Subscription[] = [];
  disableSubmit: boolean = true;
  updateMsg: string;
  isSuccess: boolean = false;
  isFailure: boolean = false;
  liquidityForm: FormGroup;
  submittedData;
  
  attributeID: number;      // To be set when attribute is being edited

  levelOptions : string[]; 
  levelFilteredOptions: Observable<string[]>;

  asOfDate: Date;

  constructor(
    public dialogRef: MatDialogRef<AttributeEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private liquiditySummarySvc: LiquiditySummaryService,
    private dataSvc: DataService,
    private msalUserSvc: MsalUserService,
    public dialog: MatDialog
  ) { }

  isNewAttribute(refData, attribute: string, level: string): boolean {

    for(let i: number = 0; i < this.data.refData?.length; i+= 1){

      if(this.data.refData[i]?.level === level && String(this.data.refData[i]?.attribute).toLowerCase().trim() === attribute?.toLowerCase().trim()){
        return false;
      }
    }
    return true;
  }

  liquidityValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    let isRelative: boolean = control.get('isRelative').value;
    let days: number, date: string;
    
    if(isRelative){
      days = control.get('days').value;
    }
    else{
      date = moment(control.get('date').value).format('YYYY-MM-DD');
    }
    let level: string = control.get('level').value;
    let attribute: string = control.get('attribute').value;

    let Dt:boolean = date !== null && date !== 'Invalid date'
    let Days: boolean = days !== null && days >= 0;
    let Lvl:boolean = !!level && this.levelOptions.includes(level); 

    if(!this.levelOptions.includes(level)){
      control.get('level').setErrors({invalid: true});
    }
    let Att:boolean = false;

    if(this.data.action === 'EDIT'){
      if(!!attribute){
        if(attribute === this.data.rowRef.attribute)
          Att = true;
        else if(this.isNewAttribute(this.data.refData, attribute, level))
          Att = true
        else{
           Att = false
           this.liquidityForm.get('attribute').setErrors({invalid: true})
        }
      }
      else Att = false
    }
    else if(this.data.action === 'ADD'){
      Att = !!attribute && this.isNewAttribute(this.data.refData, attribute, level);
    }

    return ((isRelative ? Days : Dt) && Lvl && Att) ? { validated: true } : { validated: false };
  }

  _filter(options: string[],value:string): string []{
    if(value === null)
      return options;
    const filterValue = value.toLowerCase();
    return options.filter(op => op.toLowerCase().includes(filterValue));
  }

  changeListeners(){

    this.subscriptions.push(this.liquidityForm.valueChanges
      .subscribe(_ => {
      if(this.liquidityForm.errors?.['validated'] && this.liquidityForm.touched && !this.isSuccess){
        this.disableSubmit = false;
      }
      else if(!this.liquidityForm.errors?.['validated']){
        this.disableSubmit = true;
      }
    }));

    this.levelFilteredOptions = this.liquidityForm.get('level').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.levelOptions, value))
    );
  }

  getModel(): LiquiditySummaryAttributeModel {

    let model: LiquiditySummaryAttributeModel = <LiquiditySummaryAttributeModel>{};

    model.id = this.attributeID              // Set to null, if action = ADD
    model.attribute = this.liquidityForm.get('attribute').value;
    model.isRelative = this.liquidityForm.get('isRelative').value;
    model.entryDate = (model.isRelative) 
                      ? null 
                      : new Date(moment(this.liquidityForm.get('date').value).format('YYYY-MM-DD'))
    
    
    model.relativeDays = (model.isRelative) ? this.liquidityForm.get('days').value : null;
    model.level = this.liquidityForm.get('level').value;
    model.username = this.msalUserSvc.getUserName();
    return model;
  }
  
  onSubmit(){
    this.disableSubmit = true;
    let model: LiquiditySummaryAttributeModel = this.getModel();

    this.subscriptions.push(this.liquiditySummarySvc.putLiquiditySummaryAttribute(model).subscribe({
      next: data => {

        if(data?.isSuccess){
          this.submittedData = model;

          this.disableSubmit = true;
          this.updateMsg = 'Successfully ' + data.returnMessage;
          this.isSuccess = true;
          this.isFailure = false;
        }
      },
      error: error => {
        this.disableSubmit = false;
        this.updateMsg = 'Failed to Insert/Update';
        this.isFailure = true;
        this.isSuccess = false;
      }
    }))
  }

  ngOnInit(): void {

    this.levelOptions = this.data.refData.map(x => x['level'])
    this.levelOptions = [... new Set(this.levelOptions)]

                        // this.data.asOfDate (string of type: 'YYYY-MM-DD')
    this.asOfDate = new Date(parseInt(this.data.asOfDate.substring(0,4)),
                             parseInt(this.data.asOfDate.substring(5,7)) - 1,
                             parseInt(this.data.asOfDate.substring(8,10))
  );

    this.liquidityForm = new FormGroup({
      date: new FormControl(new Date(this.asOfDate), Validators.required),
      days: new FormControl(0, Validators.required),
      level: new FormControl(null, Validators.required),
      attribute: new FormControl(null, Validators.required),
      isRelative: new FormControl(false, Validators.required)
    },{
      validators: this.liquidityValidator
    })

    if(this.data.action === 'EDIT'){

      this.attributeID = this.data.rowRef?.id;
      this.liquidityForm.patchValue({
        level: this.data.rowRef.level,
        attribute: this.data.rowRef.attribute,
        isRelative: this.data.rowRef.isRelative,
        days: (this.data.rowRef.isRelative) ? this.data.rowRef.relativeDays : null,
        date: (this.data.rowRef.isRelative) ? null : this.asOfDate
      })
    }
    else if(this.data.action === 'ADD'){
      this.attributeID = null;

    }

    this.changeListeners();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onClose(){
    this.dialogRef.close({
      event: this.isSuccess ? 'Close with success' : 'Close',
      data: this.isSuccess ? this.submittedData : null,
      action: this.data.action 
    })
  }


  onDelete(){
    let confirmTextString = 'Are you sure you want to delete this attribute ?'
    const dialogRef = this.dialog.open(ConfirmPopupComponent, { 
      data:{headerText:confirmTextString},
      maxHeight: '95vh'
    })
    this.subscriptions.push(dialogRef.afterClosed().subscribe((value)=>{
      if(value.action==='Confirm'){
        let model: LiquiditySummaryAttributeModel = this.getModel();
        this.subscriptions.push(this.liquiditySummarySvc.deleteLiquiditySummaryAttribute(model.id).subscribe({
          next: data => {

            if(data?.isSuccess){
              this.isSuccess = true;
              this.isFailure = false;
              this.dialogRef.close({
                event:'Close with success' ,
                data:  this.submittedData,
                action: this.data.action
              })
              this.dataSvc.setWarningMsg(`Successfully deleted ${model.attribute}`,"Dismiss","ark-theme-snackbar-normal")
            }

          },
          error: error => {
            this.updateMsg = 'Failed to Delete';
            this.isFailure = true;
            this.isSuccess = false;
            this.dataSvc.setWarningMsg("Attribute could not be deleted","Dismiss","ark-theme-snackbar-error")
          }
          
        }))

      }
    }))
  }

}
