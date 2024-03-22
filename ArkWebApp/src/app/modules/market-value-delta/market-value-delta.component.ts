import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AsOfDateRange } from 'src/app/shared/models/FilterPaneModel';
import { UtilService } from './services/util.service';
import { MarketValueDeltaModel } from 'src/app/shared/models/MarketValueDeltaModel';
import { GridConfigService } from './services/grid-config.service';

@Component({
  selector: 'app-market-value-delta',
  templateUrl: './market-value-delta.component.html',
  styleUrls: ['../../shared/styles/grid-page.layout.scss','./market-value-delta.component.scss'],
  providers: [
    UtilService,
    GridConfigService
  ]
})
export class MarketValueDeltaComponent implements OnInit {

  currentAsOfDateRange$ : Observable<AsOfDateRange>
  currentNewIssuerOrAsset$ : Observable<string>
  rowData$: Observable<MarketValueDeltaModel[]>


  constructor(
    private utilService: UtilService
  ) { 
    this.currentAsOfDateRange$ = this.utilService.currentAsOfDateRange$
    this.currentNewIssuerOrAsset$ = this.utilService.currentNewIssuerOrAsset$
    this.rowData$ = this.utilService.rowData$
  }

  ngOnInit(): void {
  }

}
