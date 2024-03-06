import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IRRCalcService } from 'src/app/core/services/IRRCalculation/irrcalc.service';
import { DataService } from 'src/app/core/services/data.service';
import { ModelUtilService } from '../portfolio-modeller/model/model-util.service';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';
import { AdaptableApi, AdaptableOptions, AdaptableReadyInfo } from '@adaptabletools/adaptable-angular-aggrid';
import { CommonConfig } from 'src/app/configs/common-config';
import { NoRowsOverlayComponent } from '@ag-grid-community/core/dist/cjs/es5/rendering/overlays/noRowsOverlayComponent';
import { autosizeColumnExceptResized, loadSharedEntities, presistSharedEntities } from 'src/app/shared/functions/utilities';
import { PortfolioManageModelService } from '../service/portfolio-manage-model.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-portfolio-manage-model',
  templateUrl: './portfolio-manage-model.component.html',
  styleUrls: ['./portfolio-manage-model.component.scss'],
  providers: [ModelUtilService,
    PortfolioManageModelService
  ]
})
export class PortfolioManageModelComponent implements OnInit {

  rowData:any[]
  rowData$:Observable<any[]> = of([])
  agGridModules: Module[] = CommonConfig.AG_GRID_MODULES;
  constructor(
    private dataSvc: DataService,    
    public modelSvc: ModelUtilService,
    public portfolioManageModelSvc: PortfolioManageModelService,
    public dialogRef: MatDialogRef<PortfolioManageModelComponent>,
  ) { }

    gridApi: GridApi
    adaptableApi: AdaptableApi

    gridOptions: GridOptions = this.portfolioManageModelSvc.getGridOptions()
    columnDefs: ColDef[] = this.portfolioManageModelSvc.getColumnDefs()
    adaptableOptions: AdaptableOptions = this.portfolioManageModelSvc.getAdaptableOptions()

  ngOnInit(): void {


    // this.rowData = [
    //   {modelName: 'DL2-Masai-AC', modelDesc: 'Test', rules: '{|ColumnId|:|fund|,|Predicate|:{|PredicateId|:|Values|,|Inputs|:[|DL2|]}}', username: null, modelID: 2},
    //   {modelName: 'CS-Crypto-Equity-Hypo1', modelDesc: null, rules: null, username: null, modelID: 4},
    //   {modelName: 'CS-Crypto-Equity-NoOverride', modelDesc: null, rules: null, username: null, modelID: 9},
    //   {modelName: 'DL2-No-Override', modelDesc: null, rules: '{|ColumnId|:|fund|,|Predicate|:{|PredicateId|:|Values|,|Inputs|:[|DL2|]}}', username: null, modelID: 10}
    // ]

    // this.rowData$ = this.irrCalcService.getPortfolioModels(this.dataSvc.getCurrentUserName())
  }

  onGridReady(params: GridReadyEvent){
    params.api.closeToolPanel();
  }

  onAdaptableReady(params: AdaptableReadyInfo){
  }

  onClose(){
    this.dialogRef.close()
  }

}
