import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AumDeltaComponent } from './aum-delta.component';
import { AUMDeltaRoutingModule } from './aum-delta.routing.module';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatCardModule } from '@angular/material/card';



@NgModule({
  declarations: [

  
    AumDeltaComponent
  ],
  imports: [
    CommonModule,
    AUMDeltaRoutingModule,

    AdaptableAngularAgGridModule,
    AgGridModule,

    MatCardModule
  ]
})
export class AumDeltaModule { }
