import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UtilService } from './services/util.service';
import { PoscashGridConfigService } from './services/poscash-grid-config.service';
import { PortfolioPositionCashflowService } from 'src/app/core/services/PortfolioPositionCashflow/portfolio-position-cashflow.service';

@Component({
  selector: 'app-portfolio-position-cashflows',
  templateUrl: './portfolio-position-cashflows.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./portfolio-position-cashflows.component.scss'],
  
  providers: [
    UtilService,
    PoscashGridConfigService
  ]
})
export class PortfolioPositionCashflowsComponent implements OnInit {

  asOfDate$: Observable<string>
  cashflowType$: Observable<string>
  constructor(
    public  gridUtilSvc: UtilService,
    public poscashGridConfigSvc: PoscashGridConfigService
  ) {
    this.asOfDate$ = this.gridUtilSvc.changeInAsOfDate$
    this.cashflowType$ = this.gridUtilSvc.changeInCashFlowTypeFilter$    
  }
  
  ngOnInit(): void {
        
  }

}


