import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EqualisationService } from 'src/app/core/services/Equalisation/equalisation.service';
import { UtilService } from './services/util.service';
import { EqPoscashGridConfigService } from './services/eq-poscash-grid-config.service';

@Component({
  selector: 'app-position-cashflows',
  templateUrl: './position-cashflows.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss','./position-cashflows.component.scss'],
  providers: [
    UtilService,
    EqPoscashGridConfigService
  ]
})
export class PositionCashflowsComponent implements OnInit {
  asOfDate$: Observable<string> = this.gridUtilSvc.changeInAsOfDate$
  cashflowType$: Observable<string>
  constructor(
    public  gridUtilSvc: UtilService,
    public eqPoscashGridConfigSvc: EqPoscashGridConfigService
  ) { }
  ngOnInit(): void {
        
  }
}
