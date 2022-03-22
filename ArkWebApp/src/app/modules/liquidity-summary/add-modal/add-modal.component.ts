import { Component, OnInit, Inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';
import { LiquiditySummaryModel } from 'src/app/shared/models/LiquiditySummaryModel';
import { LiquiditySummaryService } from 'src/app/core/services/LiquiditySummary/liquidity-summary.service';
import { MsalUserService } from 'src/app/core/services/Auth/msaluser.service';

@Component({
  selector: 'app-add-modal',
  templateUrl: './add-modal.component.html',
  styleUrls: ['./add-modal.component.scss']
})
export class AddModalComponent implements OnInit {

  subscriptions: Subscription[] = [];
  disableSubmit: boolean = true;
  updateMsg: string;
  isSuccess: boolean = false;
  isFailure: boolean = false;
  liquidityForm: FormGroup;

  levelOptions : string[]; 
  fundHedgingOptions : string[];
  levelFilteredOptions: Observable<string[]>;
  fundHedgingFilteredOptions: Observable<string[]>;

  asOfDate: Date;

  constructor(
    public dialogRef: MatDialogRef<AddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private liquiditySummarySvc: LiquiditySummaryService,
    private msalUserSvc: MsalUserService
  ) { }

  liquidityValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    let date: string = moment(control.get('date').value).format('YYYY-MM-DD');
    let days: number = control.get('days').value;
    let level: string = control.get('level').value;
    let attribute: string = control.get('attribute').value;
    let amount: number = control.get('amount').value;

    let Dt:boolean = date !== null && date !== 'Invalid date'
    let Days: boolean = !!days;
    let Lvl:boolean = !!level && this.levelOptions.includes(level); 
    let Att:boolean = !!attribute;
    let Amt: boolean = !!amount;

    return (Dt && Days && Lvl && Att && Amt) ? { validated: true } : { validated: false };
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

      if(this.liquidityForm.errors?.['validated'] && this.liquidityForm.touched){
        this.disableSubmit = false;
      }
      else if(!this.liquidityForm.errors?.['validated']){
        this.disableSubmit = true;
      }
    }));

    this.subscriptions.push(this.liquidityForm.get('days').valueChanges.subscribe(days => {
      /*
      Adding days to date in JS.
        https://stackoverflow.com/a/19691491/17121446      
      */
      let dt = new Date(this.asOfDate);
      dt.setDate(dt.getDate() + (parseInt(days) >= 0 ? parseInt(days) : 0))

      this.liquidityForm.patchValue({
        date: dt
      })

    }))

    this.levelFilteredOptions = this.liquidityForm.get('level').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.levelOptions, value))
    );

    this.fundHedgingFilteredOptions = this.liquidityForm.get('fundHedging').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.fundHedgingOptions, value))
    );

  }

  getModel(): LiquiditySummaryModel {

    let model: LiquiditySummaryModel = <LiquiditySummaryModel>{};
    model.date = this.liquidityForm.get('date').value;
    model.level = this.liquidityForm.get('level').value;
    model.attribute = this.liquidityForm.get('attribute').value;
    model.fundHedging = this.liquidityForm.get('fundHedging').value;
    model.amount = this.liquidityForm.get('amount').value;

    model.createdBy = this.msalUserSvc.getUserName();
    model.modifiedBy = this.msalUserSvc.getUserName();
    return model;
  }
  
  onSubmit(){
    this.disableSubmit = true;
    let model: LiquiditySummaryModel = this.getModel();

    this.subscriptions.push(this.liquiditySummarySvc.putLiquiditySummary(model).subscribe({
      next: data => {

        if(data?.isSuccess){
          this.disableSubmit = true;
          this.updateMsg = 'Successfully Inserted';
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
    
    this.asOfDate = new Date(parseInt(this.data.asOfDate.substring(0,4)),
      parseInt(this.data.asOfDate.substring(5,7)) - 1,
      parseInt(this.data.asOfDate.substring(8,10))
    );

    this.levelOptions = [
      'Current Cash',
      'Net Cash',
      'RCF Commitment',
      'Liquidity',
      'Known Outflows'
    ];

    this.fundHedgingOptions = this.data.fundHedgings;
  
    this.liquidityForm = new FormGroup({
      date: new FormControl(new Date(this.asOfDate), Validators.required),
      days: new FormControl(0, Validators.required),
      level: new FormControl(null, Validators.required),
      attribute: new FormControl(null, Validators.required),
      amount: new FormControl(null, Validators.required),
      fundHedging: new FormControl(null, Validators.required)
    },{
      validators: this.liquidityValidator
    })

    this.changeListeners();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onClose(){
    this.dialogRef.close({
      event: this.isSuccess ? 'Close with success' : 'Close'
    })
  }
}
