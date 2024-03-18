import { AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { PortfolioManageModelService } from '../service/portfolio-manage-model.service';
import { VModel } from 'src/app/shared/models/IRRCalculationsModel';

@Component({
  selector: 'app-portfolio-manage-model-grid',
  templateUrl: './portfolio-manage-model-grid.component.html',
  styleUrls: ['./portfolio-manage-model-grid.component.scss']
})
export class PortfolioManageModelGridComponent implements OnInit {

  @Input() columnDefs             : ColDef[]
  @Input() gridOptions            : GridOptions
  @Input() adaptableOptions       : AdaptableOptions
  @Input() rowData$               : Observable<VModel[]>

  agGridModules                   : Module[] = CommonConfig.AG_GRID_MODULES;

  constructor(
    public portfolioManageModelSvc:PortfolioManageModelService
  ) { }

  ngOnInit(): void {
    this.portfolioManageModelSvc.updateFirstLoad(true)
  }

  onGridReady(params: GridReadyEvent){
    this.portfolioManageModelSvc.gridApi = params.api
    params.api.closeToolPanel();
  }

  onAdaptableReady(params: AdaptableReadyInfo){
    this.portfolioManageModelSvc.adaptableApi = params.adaptableApi
  }

}
