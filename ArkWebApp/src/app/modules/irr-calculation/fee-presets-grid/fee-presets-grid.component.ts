import { ColDef, GridOptions } from '@ag-grid-community/core';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { AccessService } from 'src/app/core/services/Auth/access.service';
import { DataService } from 'src/app/core/services/data.service';
import { FeePresetsService } from 'src/app/core/services/FeePresets/fee-presets.service';
import { FeeCalculationSummaryComponent } from '../../fee-calculation/fee-calculation-summary/fee-calculation-summary.component';
import { FeeCashflowsComponent } from '../../fee-calculation/fee-cashflows/fee-cashflows.component';
import { FeePresetsComponent } from '../../fee-presets/fee-presets.component';

@Component({
  selector: 'app-fee-presets-grid',
  templateUrl: './fee-presets-grid.component.html',
  styleUrls: ['./fee-presets-grid.component.scss']
})
export class FeePresetsGridComponent implements OnInit {

  @Input() feePreset: string
  columnDefs: ColDef[]
  gridOptions: GridOptions
  rowData: any[]
  constructor(private dataSvc: DataService, 
    private feePresetSvc: FeePresetsService,
    private accessSvc: AccessService,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.columnDefs = this.feePresetSvc.columnDefs;

    this.gridOptions = {
      enableRangeSelection: true,
      columnDefs: this.columnDefs,
      // onGridReady: this.onGridReady.bind(this),
      // components: {
      //   AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      // },
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        enableValue: true,
        enableRowGroup: true  
      },
      excelStyles: CommonConfig.GENERAL_EXCEL_STYLES
    }

    this.columnDefs = [
      ...this.columnDefs,
      ...[
        { field: 'cashYield' },
        { field: 'financingRate' },
        { field: 'financingRatio' },
        { field: 'totalYield' }
      ]

    ]
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.feePreset.currentValue){
      forkJoin([
        this.feePresetSvc.getFundInvestmentData(this.feePreset),
        this.feePresetSvc.getFundFeeData(this.feePreset)
      ]).subscribe(d => {

        let D = []

        console.log(d)
        D.push({ ...d[0][0],...d[1][0] })
        this.rowData = D;

        console.log(D)
      });
    }
  }

}
