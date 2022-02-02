import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-update-confirm',
  templateUrl: './update-confirm.component.html',
  styleUrls: ['./update-confirm.component.scss']
})
export class UpdateConfirmComponent implements OnInit {

  confirmText: string;

  constructor(public dialogRef: MatDialogRef<UpdateConfirmComponent>, 
    @Inject(MAT_DIALOG_DATA) public request: any) { }

  ngOnInit(): void {
    if(this.request.actionType === 'EDIT')
      this.confirmText = 'Are you sure you want to edit this capital activity?';
    else if(this.request.actionType === 'ERROR-MSG')
      this.confirmText = this.request.errorMsg;
  }

  closeDialog(action: string): void {
    this.dialogRef.close({action: action});
  }
}
