import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-file-dropzone',
  templateUrl: './file-dropzone.component.html',
  styleUrls: ['./file-dropzone.component.scss']
})
export class FileDropzoneComponent implements OnInit {

  @Input() header: string;
  @Input() hideDropzone: boolean | null;

  @ContentChild('fileTemplate') fileTemplate: TemplateRef<any> | undefined;
  @ContentChild('message') message: TemplateRef<any> | undefined;
  @ContentChild('grid') grid: TemplateRef<any> | undefined;
  @ContentChild('submit') submit: TemplateRef<any> | undefined;
  @ContentChild('dropzone') dropzone: TemplateRef<any> | undefined;

  @Output() fileEmitter = new EventEmitter<File>();


  isHovering: boolean;
  files: File[] = []; /** Can Read multiple files at once */
  selectedFile: File;


  onDrop(files: FileList) {

    this.selectedFile = files.length >= 1 ? files[files.length - 1] : null;  /** Read only one file at a time */

    if(this.selectedFile){
      this.fileEmitter.emit(this.selectedFile);
    }
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  fileUpload(event){
    this.selectedFile = event.target.files[0];
    
    if(this.selectedFile){
      this.fileEmitter.emit(this.selectedFile)
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
