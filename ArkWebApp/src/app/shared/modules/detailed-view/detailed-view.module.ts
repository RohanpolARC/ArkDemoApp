import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultDetailedViewComponent } from './default-detailed-view/default-detailed-view.component';
import { DefaultDetailedViewPopupComponent } from './default-detailed-view-popup/default-detailed-view-popup.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    DefaultDetailedViewComponent,
    DefaultDetailedViewPopupComponent
  ],
  imports: [
    CommonModule,
    AgGridModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports:[
    DefaultDetailedViewComponent,
    DefaultDetailedViewPopupComponent
  ]
})
export class DetailedViewModule { }
