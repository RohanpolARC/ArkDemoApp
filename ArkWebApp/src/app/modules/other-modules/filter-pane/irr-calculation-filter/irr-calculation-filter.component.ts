import { Component, OnInit } from '@angular/core';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-irr-calculation-filter',
  templateUrl: './irr-calculation-filter.component.html',
  styleUrls: ['./irr-calculation-filter.component.scss']
})
export class IrrCalculationFilterComponent implements OnInit {

  asOfDate: string = null;
  constructor(private irrCalcSvc: IRRCalcService) { }

  ngOnInit(): void {
    this.asOfDate = getMomentDateStr(getLastBusinessDay());
    this.onAsOfDateChange(this.asOfDate)
  }

  onAsOfDateChange(date){
    this.irrCalcSvc.changeSearchDate(getMomentDateStr(date));
  }
}
