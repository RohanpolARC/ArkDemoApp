import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AumReportComponent } from './aum-report.component';
import { AUMReportRoutingModule } from './aum-report.routing.module';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';



@NgModule({
  declarations: [

  
    AumReportComponent
  ],
  imports: [
    CommonModule,
    AUMReportRoutingModule,

    AdaptableAngularAgGridModule,
    AgGridModule,

    MatCardModule
  ]
})
export class AumReportModule { }
