import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PresetGridAction } from '../fee-presets.component';

@Component({
  selector: 'app-investmentdata-form',
  templateUrl: './investmentdata-form.component.html',
  styleUrls: ['./investmentdata-form.component.scss']
})
export class InvestmentdataFormComponent implements OnInit {

  @Input() presetName: string;
  @Input() feeInvestment;
  @Input() action: PresetGridAction = PresetGridAction.ADD;

  form: FormGroup
  constructor() { }

  ngOnChanges(changes: SimpleChanges)
  {
    if(!this.form){
      this.initForm();
    }

    if(changes?.presetName?.currentValue){
      this.form.patchValue({
        presetName: this.presetName
      })
    }
    if(changes?.feeInvestment?.currentValue){

      this.form.patchValue({
        presetName: this.feeInvestment.presetName,
        cashYield: this.feeInvestment.cashYield,
        totalYield: this.feeInvestment.totalYield,
        financingRate: this.feeInvestment.financingRate,
        investmentPeriod: this.feeInvestment.investmentPeriod,
        financingRatio: this.feeInvestment.financingRatio       
      })
    }
  }

  ngOnInit(): void {
    if(!this.form){
      this.initForm();
    }
  }

  initForm() {
    this.form = new FormGroup({
      presetName: new FormControl('', Validators.required),
      cashYield: new FormControl('', Validators.required),
      totalYield: new FormControl('', Validators.required),
      financingRate: new FormControl('', Validators.required),
      investmentPeriod: new FormControl('', Validators.required),
      financingRatio: new FormControl('', Validators.required)
    })
  }
}