import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AggridMatCheckboxEditorComponent } from './aggrid-mat-checkbox-editor/aggrid-mat-checkbox-editor.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AggridMatCheckboxEditorComponent
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    FormsModule
  ]
})
export class AggridMatCheckboxEditorModule { }