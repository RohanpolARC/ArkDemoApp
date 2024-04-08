import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NetReturnsRoutingModule } from './net-returns-routing.module';
import { NetReturnsComponent } from './net-returns.component';
import { NetReturnsIrrComponent } from './net-returns-irr/net-returns-irr.component';
import { NetReturnsCashflowsComponent } from './net-returns-cashflows/net-returns-cashflows.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { SsrsReportViewerModule } from 'src/app/shared/modules/ssrs-report-viewer/ssrs-report-viewer.module';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';
import { NetReturnsSummaryComponent } from './net-returns-summary/net-returns-summary.component';


@NgModule({
  declarations: [
    NetReturnsComponent,
    NetReturnsIrrComponent,
    NetReturnsCashflowsComponent,
    NetReturnsSummaryComponent
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
