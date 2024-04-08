import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss']
})
export class ConfirmationPopupComponent implements OnInit {

  confirmText: string = 'Are you sure?'
  constructor(
    public dialogRef: MatDialogRef<ConfirmationPopupComponent>, 
    @Inject(MAT_DIALOG_DATA) public request: {
      confirmText: string
    }
  ) { }

  ngOnInit(): void {

    this.confirmText = this.request.confirmText;
  }

  closeDialog(action: 'Confirm' | 'Cancel' = 'Cancel'){
    this.dialogRef.close({ action: action });
  }
}
