import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AumReportComponent } from './aum-report.component';
import { AUMReportRoutingModule } from './aum-report.routing.module';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';



@NgModule({
  declarations: [

  
    AumReportComponent
  ],
  imports: [
    CommonModule,
    AUMReportRoutingModule,

    AdaptableAngularAgGridModule,
    AgGridModule,

    MatCardModule,
    MatIconModule,
    MatFormFieldModule
  ]
})
export class AumReportModule { }
