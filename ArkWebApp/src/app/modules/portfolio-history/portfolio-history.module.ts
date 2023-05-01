import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioHistoryComponent } from './portfolio-history.component';
import { DialogDeleteComponent } from './dialog-delete/dialog-delete.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import { BtnCellRenderer} from './btn-cell-renderer.component';
import { UpdateGirModalComponent } from './update-gir-modal/update-gir-modal.component'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { PortfolioHistoryRoutingModule } from './portfolio-history-routing.module';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';

@NgModule({
  declarations: [
    PortfolioHistoryComponent,BtnCellRenderer, UpdateGirModalComponent, DialogDeleteComponent
  ],
  imports: [
    CommonModule,
    PortfolioHistoryRoutingModule,

    MatIconModule,
    MatCardModule,
    AgGridModule,
    AdaptableAngularAgGridModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,

    DetailedViewModule
  ],
  exports:[
    PortfolioHistoryComponent
  ]
})
export class PortfolioHistoryModule { }
