import { Component, Input, OnInit } from '@angular/core';
import { GridConfigService } from '../services/grid-config.service';

@Component({
  selector: 'app-fee-attribution-grid',
  templateUrl: './fee-attribution-grid.component.html',
  styleUrls: ['./fee-attribution-grid.component.scss']
})
export class FeeAttributionGridComponent implements OnInit {

  constructor(public gridConfigSvc: GridConfigService) { 
  }
  @Input() rowData = [];

  ngOnInit(): void { }
}
