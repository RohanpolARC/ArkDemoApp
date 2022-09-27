import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioHistoryComponent } from './portfolio-history.component';
import { DialogDeleteComponent } from './dialog-delete/dialog-delete.component';
import { MatIconModule } from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import {BtnCellRenderer} from './btn-cell-renderer.component';
import { UpdateGirModalComponent } from './update-gir-modal/update-gir-modal.component'
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PortfolioHistoryComponent,BtnCellRenderer, UpdateGirModalComponent, DialogDeleteComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    AgGridModule.withComponents([BtnCellRenderer]),
    AdaptableAngularAgGridModule,
    MatDialogModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  exports:[
    PortfolioHistoryComponent
  ]
})
export class PortfolioHistoryModule { }
