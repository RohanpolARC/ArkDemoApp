import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultDetailedViewComponent } from './default-detailed-view/default-detailed-view.component';
import { DefaultDetailedViewPopupComponent } from './default-detailed-view-popup/default-detailed-view-popup.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DetailedViewService } from './detailed-view.service';
import { MatSelectModule } from '@angular/material/select';
import { MultiSelectModule } from '../../components/multi-select/multi-select.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    DefaultDetailedViewComponent,
    DefaultDetailedViewPopupComponent
  ],
  imports: [
    CommonModule,
    AgGridModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MultiSelectModule,
    MatProgressSpinnerModule
  ],
  exports:[
    DefaultDetailedViewComponent,
    DefaultDetailedViewPopupComponent
  ],
  providers: [
    DetailedViewService
  ]
})
export class DetailedViewModule { }
