import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-popup',
  templateUrl: './confirm-popup.component.html',
  styleUrls: ['./confirm-popup.component.scss']
})
export class ConfirmPopupComponent implements OnInit {

  constructor(    
    public dialogRef:MatDialogRef<ConfirmPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{
      fundHedging:string
    }) { }

  ngOnInit(): void {
  }

}
