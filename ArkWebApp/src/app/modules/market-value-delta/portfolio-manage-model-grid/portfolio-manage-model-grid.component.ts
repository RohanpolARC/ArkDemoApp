import { AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { ColDef, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonConfig } from 'src/app/configs/common-config';
import { VModel } from 'src/app/shared/models/GeneralModel';
import { PortfolioManageModelService } from '../services/portfolio-manage-model.service';


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
  }

  onAdaptableReady(params: AdaptableReadyInfo){
    this.portfolioManageModelSvc.adaptableApi = params.adaptableApi
    this.portfolioManageModelSvc.gridApi = params.agGridApi
    params.agGridApi.closeToolPanel();
  }

}
