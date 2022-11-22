import { Component, OnInit } from '@angular/core';
import { PositionScreenService } from 'src/app/core/services/PositionsScreen/positions-screen.service';
import { getLastBusinessDay, getMomentDateStr } from 'src/app/shared/functions/utilities';

@Component({
  selector: 'app-position-screen-filter',
  templateUrl: './position-screen-filter.component.html',
  styleUrls: ['./position-screen-filter.component.scss']
})
export class PositionScreenFilterComponent implements OnInit {

  asOfDate: string = null;
  constructor(
    private positionScreenSvc: PositionScreenService
  ) { }

  ngOnInit(): void {
    this.asOfDate = getMomentDateStr(getLastBusinessDay());
    this.onAsOfDateChange(this.asOfDate)
  }

  onAsOfDateChange(date){
    this.positionScreenSvc.changeSearchDate(getMomentDateStr(date));
  }

}
