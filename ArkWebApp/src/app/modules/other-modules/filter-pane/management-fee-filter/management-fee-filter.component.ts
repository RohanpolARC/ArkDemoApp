import { Component, OnInit } from '@angular/core';
import { ManagementFeeService } from 'src/app/core/services/ManagementFee/management-fee.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-management-fee-filter',
  templateUrl: './management-fee-filter.component.html',
  styleUrls: ['./management-fee-filter.component.scss']
})
export class ManagementFeeFilterComponent implements OnInit {

  asOfDate: string = null;
  constructor(private managementFeeSvc: ManagementFeeService) { }

  ngOnInit(): void {
    this.asOfDate = getMomentDateStr(getLastBusinessDay());
    this.onAsOfDateChange(this.asOfDate)
  }

  onAsOfDateChange(date){
    this.managementFeeSvc.changeSearchDate(getMomentDateStr(date));
  }

}
