import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reviewer-confirm',
  templateUrl: './reviewer-confirm.component.html',
  styleUrls: ['./reviewer-confirm.component.scss']
})
export class ReviewerConfirmComponent implements OnInit {

  remark = new FormControl('');
  confirmText: string = 'Are you sure?'
  constructor(
    public dialogRef: MatDialogRef<ReviewerConfirmComponent>, 
    @Inject(MAT_DIALOG_DATA) public request: {
      confirmText: string
    }
  ) { }

  ngOnInit(): void {

    this.confirmText = this.request.confirmText;
  }

  closeDialog(action: 'Confirm' | 'Cancel' = 'Cancel'){
    this.dialogRef.close({ action: action, remark: this.remark.value });
  }

}
