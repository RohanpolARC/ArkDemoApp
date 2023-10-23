import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NetReturnsRoutingModule } from './net-returns-routing.module';
import { NetReturnsComponent } from './net-returns.component';
import { NetReturnsSummaryComponent } from './net-returns-summary/net-returns-summary.component';
import { NetReturnsCashflowsComponent } from './net-returns-cashflows/net-returns-cashflows.component';
import { MatCardModule } from '@angular/material/card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatButtonModule } from '@angular/material/button';
import { SsrsReportViewerModule } from 'src/app/shared/modules/ssrs-report-viewer/ssrs-report-viewer.module';
import { MatDialogModule } from '@angular/material/dialog';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';



@NgModule({
  declarations: [
    NetReturnsComponent,
    NetReturnsSummaryComponent,
    NetReturnsCashflowsComponent
  ],
  imports: [
    CommonModule,
    NetReturnsRoutingModule,
    MatCardModule,
    AdaptableAngularAgGridModule,
    AgGridModule,

    MatButtonModule,

    SsrsReportViewerModule,
    MatDialogModule,
    DetailedViewModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class NetReturnsModule { }
