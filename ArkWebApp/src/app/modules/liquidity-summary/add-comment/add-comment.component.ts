import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LiquiditySummaryService } from 'src/app/core/services/LiquiditySummary/liquidity-summary.service';
import { DataService } from 'src/app/core/services/data.service';
import { ConfirmComponentConfigure } from 'src/app/shared/models/GeneralModel';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent implements OnInit {

  subscriptions : Subscription[] = []

  constructor(
    public dialogRef: MatDialogRef<AddCommentComponent>,
    @Inject(MAT_DIALOG_DATA) public configData: ConfirmComponentConfigure,
    public liquiditySummarySvc: LiquiditySummaryService,
    public dataSvc:DataService


  ) { }

  ngOnInit(): void {

  }

  onActionEvent(event:any){
    if(event.action==='Confirm'){
      let commentModel = {
        fundHedging:this.configData.data.fundHedging,
        comment:event.textFieldValue?event.textFieldValue:'',
        modifiedBy:this.dataSvc.getCurrentUserName()
      }
      this.subscriptions.push(this.liquiditySummarySvc.putLiquiditySummaryComments(commentModel).subscribe((data)=>{
        if(data==='Success'){
          this.dataSvc.setWarningMsg("Successfully modified the comment","dismiss",'ark-theme-snackbar-success')
        }else{
          this.dataSvc.setWarningMsg("Failed to modify the comment","dismiss",'ark-theme-snackbar-error')
        }
        this.dialogRef.close()
      }))
    }else{
      this.dialogRef.close()

    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(_=>
      _.unsubscribe()
    )
  }

}
