import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultDetailedViewComponent } from './default-detailed-view/default-detailed-view.component';
import { DefaultDetailedViewPopupComponent } from './default-detailed-view-popup/default-detailed-view-popup.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { DetailedViewService } from './detailed-view.service';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MultiSelectModule } from '../../components/multi-select/multi-select.module';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

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
