import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDropzoneComponent } from './file-dropzone/file-dropzone.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DropzoneDirective } from './dropzone.directive';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    FileDropzoneComponent,
    DropzoneDirective
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ],
  exports:[
    FileDropzoneComponent
  ]
})
export class FileDropzoneModule { }
