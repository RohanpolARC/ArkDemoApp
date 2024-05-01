import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
// import { ModelUtilService } from '../portfolio-modeller/model/model-util.service';
import { ColDef, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { AdaptableApi, AdaptableOptions } from '@adaptabletools/adaptable-angular-aggrid';
import { CommonConfig } from 'src/app/configs/common-config';

import { MatDialogRef } from '@angular/material/dialog';
import { PortfolioManageModelService } from '../services/portfolio-manage-model.service';

@Component({
  selector: 'app-portfolio-manage-model',
  templateUrl: './portfolio-manage-model.component.html',
  styleUrls: ['./portfolio-manage-model.component.scss'],
  providers: [
    PortfolioManageModelService
  ]
})
export class PortfolioManageModelComponent {

  rowData$:Observable<any[]> = this.portfolioManageModelSvc.rowData$
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES;
  constructor(
    public portfolioManageModelSvc: PortfolioManageModelService,
    public dialogRef: MatDialogRef<PortfolioManageModelComponent>,
  ) { }

  gridApi: GridApi
  adaptableApi: AdaptableApi

  gridOptions: GridOptions = this.portfolioManageModelSvc.getGridOptions()
  columnDefs: ColDef[] = this.portfolioManageModelSvc.getColumnDefs()
  adaptableOptions: AdaptableOptions = this.portfolioManageModelSvc.getAdaptableOptions()

  onClose(){
    this.dialogRef.close()
  }

}
