import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PresetGridAction } from '../fee-presets.component';

@Component({
  selector: 'app-investmentdata-form',
  templateUrl: './investmentdata-form.component.html',
  styleUrls: ['./investmentdata-form.component.scss']
})
export class InvestmentdataFormComponent implements OnInit {

  @Input() fundName: string;
  @Input() feeInvestment;
  @Input() action: PresetGridAction = PresetGridAction.ADD;

  form: FormGroup
  constructor() { }

  ngOnChanges(changes: SimpleChanges)
  {
    if(!this.form){
      this.initForm();
    }

    if(changes?.fundName?.currentValue){
      this.form.patchValue({
        fundName: this.fundName
      })
    }
    if(changes?.feeInvestment?.currentValue){

      this.form.patchValue({
        fundName: this.feeInvestment.fundName,
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
      fundName: new FormControl('', Validators.required),
      cashYield: new FormControl('', Validators.required),
      totalYield: new FormControl('', Validators.required),
      financingRate: new FormControl('', Validators.required),
      investmentPeriod: new FormControl('', Validators.required),
      financingRatio: new FormControl('', Validators.required)
    })
  }
}