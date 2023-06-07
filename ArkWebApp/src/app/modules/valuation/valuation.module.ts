import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValuationRoutingModule } from './valuation-routing.module';
import { ValuationComponent } from './valuation.component';
import { ValuationGridComponent } from './valuation-grid/valuation-grid.component';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from '@ag-grid-community/angular';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { ValuationGridService } from './service/valuation-grid.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkOverrideMasterComponent } from './mark-override-master/mark-override-master.component';
import { WSOMarkDetailComponent } from './wsomark-detail/wsomark-detail.component';

@NgModule({
  declarations: [
    ValuationComponent,
    ValuationGridComponent,
    MarkOverrideMasterComponent,
    WSOMarkDetailComponent
  ],
  imports: [
    CommonModule,
    ValuationRoutingModule,
    MatCardModule,
    AgGridModule,
    AdaptableAngularAgGridModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,

    DetailedViewModule
  ],
  providers: [
    ValuationGridService
  ]
})
export class ValuationModule { }
