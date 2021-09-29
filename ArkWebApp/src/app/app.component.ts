import { Component } from '@angular/core';  
import { DataService } from './core/services/data.service';  
import {
  ColDef,
  GridApi,
  GridOptions,
  Module,
} from '@ag-grid-community/all-modules';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';

import * as moment from 'moment'
import {MatAccordion} from '@angular/material/expansion';
import { MatIconRegistry } from '@angular/material/icon';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import charts from '@adaptabletools/adaptable-plugin-charts';
import {
  ActionColumnButtonContext,
  AdaptableApi,
  AdaptableButton,
  AdaptableOptions,
  CustomToolPanelButtonContext,
  MenuContext,
  PredicateDefHandlerParams,
  ToolPanelButtonContext,
} from '@adaptabletools/adaptable-angular-aggrid';
import { AdaptableToolPanelAgGridComponent } from '@adaptabletools/adaptable/src/AdaptableComponents';
import { BtnCellRenderer } from './modules/portfolio-history/btn-cell-renderer.component';
import {PortfolioHistoryComponent} from './modules/portfolio-history/portfolio-history.component'
//import finance from '@adaptabletools/adaptable-plugin-finance';

@Component({  
  selector: 'app-root',  
  templateUrl: './app.component.html',  
  styleUrls: ['./app.component.scss']  
})  
export class AppComponent {  
  title = 'AzureMSALAngular';  

  public userName:string;
  public rightSidebarOpened:boolean=false;
  public leftSIdebarOpened:boolean=true;

  constructor(private http: HttpClient,private dataService: DataService,public dialog: MatDialog,iconRegistry:MatIconRegistry) {

}   
  
ngOnInit(): void { 
    
      
    this.userName=this.dataService.getCurrentUserName()

}  
  
  logout(){  
    this.dataService.logout();  
  }  

} 