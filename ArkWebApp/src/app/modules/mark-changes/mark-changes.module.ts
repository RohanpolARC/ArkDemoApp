import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkChangesComponent } from './mark-changes.component';
import { MarkChangesRoutingModule } from './mark-changes-routing.module';
import { AgGridModule } from '@ag-grid-community/angular';
import { AdaptableAngularAgGridModule } from '@adaptabletools/adaptable-angular-aggrid';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';



@NgModule({
  declarations: [
    MarkChangesComponent
  ],
  imports: [
    CommonModule,
    MarkChangesRoutingModule,

    AgGridModule,
    AdaptableAngularAgGridModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,

  ]
})
export class MarkChangesModule { }
