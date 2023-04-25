import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-default-detailed-view-popup',
  templateUrl: './default-detailed-view-popup.component.html',
  styleUrls: ['./default-detailed-view-popup.component.scss']
})
export class DefaultDetailedViewPopupComponent implements OnInit {


  failureMsg: string = null;
  header: string = 'Detailed View'
  noDataMessage: string = 'No detailed view'
  detailedViewRequest: any;

  constructor(
    public dialogRef: MatDialogRef<DefaultDetailedViewPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      detailedViewRequest: any,
      failureMsg: string,
      header: string,
      noDataMessage: string
    }
  ) { }

  ngOnInit(): void {
    if(this.data.detailedViewRequest)
      this.detailedViewRequest = this.data?.['detailedViewRequest'];
    if(this.data.failureMsg)   
      this.failureMsg = this.data?.['failureMsg'];
    if(this.data.header)
      this.header = this.data?.['header'];
    if(this.data.noDataMessage)
      this.noDataMessage = this.data?.['noDataMessage'];
    
  }

  onClose(){
    this.dialogRef.close();
  }
}
