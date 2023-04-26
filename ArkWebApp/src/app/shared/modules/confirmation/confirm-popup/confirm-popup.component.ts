import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationComponent } from '../confirmation/confirmation.component';

@Component({
  selector: 'app-confirm-popup',
  templateUrl: './confirm-popup.component.html',
  styleUrls: ['./confirm-popup.component.scss']
})
export class ConfirmPopupComponent implements OnInit {

  constructor(    
    public dialogRef:MatDialogRef<ConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{
      fundHedging:string
    }) { }

  ngOnInit(): void {
  }

}
