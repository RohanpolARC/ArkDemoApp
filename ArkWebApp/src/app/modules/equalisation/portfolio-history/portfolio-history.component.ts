import { Component, OnInit } from '@angular/core';
import { GridConfigService } from './services/grid-config.service';
import { UtilService } from './services/util.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-portfolio-history',
  templateUrl: './portfolio-history.component.html',
  styleUrls: ['../../../shared/styles/grid-page.layout.scss', './portfolio-history.component.scss'],
  providers: [
    GridConfigService,
    UtilService
  ]
})
export class PortfolioHistoryComponent implements OnInit {
  constructor(
    private utilSvc: UtilService
  ) { }

  changeInAsOfDate$: Observable<string> = this.utilSvc.changeInAsOfDate$

  ngOnInit(): void {
  }
}