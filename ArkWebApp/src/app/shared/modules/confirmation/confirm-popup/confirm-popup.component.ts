import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponentConfigure } from 'src/app/shared/models/GeneralModel';

@Component({
  selector: 'app-confirm-popup',
  templateUrl: './confirm-popup.component.html',
  styleUrls: ['./confirm-popup.component.scss']
})
export class ConfirmPopupComponent implements OnInit {

  constructor(    
    public dialogRef:MatDialogRef<ConfirmPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data:ConfirmComponentConfigure) { }

  ngOnInit(): void {
  }


  closeDialog(event :any={ action:'Cancel' }){
    this.dialogRef.close(event);
  }

}
