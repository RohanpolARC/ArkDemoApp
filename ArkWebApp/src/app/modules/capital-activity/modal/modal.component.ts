import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CapitalActivityModel, CapitalInvestment, IModal } from 'src/app/shared/models/CapitalActivityModel';
import { ModalService } from '../services/modal.service';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {

  isActionSuccessful: boolean;
  subscriptions: Subscription[] = []
  constructor(public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IModal,
    private modalSvc: ModalService) { }
  header: string;
  submitBtnText$: Observable<string> = this.modalSvc.submitBtnText$;
  isAlreadyLinked$: Observable<boolean> = this.modalSvc.isAlreadyLinked$;
  disableSubmit$: Observable<boolean> = this.modalSvc.disableSubmit$;
  validationMessage$: Observable<string> = this.modalSvc.validationMessage$;
  investmentData: CapitalInvestment[]
  getSaveState: () => 'PENDING' | 'SUCCESS' | 'FAILURE' = this.modalSvc.getSaveState.bind(this.modalSvc)
  onSubmit = this.modalSvc.onSubmit
  capitalAct: CapitalActivityModel = <CapitalActivityModel>{};
  
  ngOnInit(): void {

    if(this.data.actionType === 'EDIT')
      this.modalSvc.investmentData = this.data.gridData;
    else
      this.modalSvc.investmentData = <CapitalInvestment[]>this.data.rowData;

    this.investmentData = this.modalSvc.investmentData;
    this.modalSvc.mode = this.data.actionType;

    // setTimeout(() => {
      this.modalSvc.updateIsAlreadyLinked(false)
      this.modalSvc.updateLinkingCapitalIDs([])
    // }, 500)

    this.subscriptions.push(this.modalSvc.actionSuccessful$.pipe(
      filter((actionSuccessful: boolean) => actionSuccessful)
    ).subscribe((actionSuccessful: boolean) => {
      // Only update this once it becomes successful. Need to filter out since we cleanUpSubjects at component destruction.
      this.isActionSuccessful = actionSuccessful
    }))
  }
  ngOnDestroy(): void {
    this.modalSvc.cleanUpSubjects();

    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  close(){
    this.dialogRef.close();
  }
}