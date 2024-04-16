import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioHistoryComponent } from './portfolio-history.component';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';  
import { AgGridModule } from '@ag-grid-community/angular';
import { BtnCellRenderer} from './btn-cell-renderer.component';
import { UpdateGirModalComponent } from './update-gir-modal/update-gir-modal.component'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { FormsModule } from '@angular/forms';
import { PortfolioHistoryRoutingModule } from './portfolio-history-routing.module';
import { DetailedViewModule } from 'src/app/shared/modules/detailed-view/detailed-view.module';
import { PortfolioHistoryComponentReaderService } from './service/portfolio-history-component-reader.service';
import { PortfolioHistoryGridConfigService } from './service/portfolio-history-grid-config.service';
import { PortfolioHistoryGridUtilService } from './service/portfolio-history-grid-util.service';
import { PortfolioHistoryBusinessLogicService } from './service/portfolio-history-business-logic.service';

@NgModule({
  declarations: [
    PortfolioHistoryComponent,BtnCellRenderer, UpdateGirModalComponent
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
  ],
  providers: [
    PortfolioHistoryComponentReaderService,
    PortfolioHistoryGridConfigService,
    PortfolioHistoryGridUtilService,
    PortfolioHistoryBusinessLogicService
  ]
})
export class PortfolioHistoryModule { }
