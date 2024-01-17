import { ActionColumnContext, AdaptableButton } from '@adaptabletools/adaptable-angular-aggrid';
import { Injectable, OnDestroy } from '@angular/core';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { UtilService } from './util.service';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { error } from 'console';
import { CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';

@Injectable()
export class InvestorGridUtilService implements OnDestroy{

  constructor(private capitalActivitySvc: CapitalActivityService,
    private utilSvc: UtilService) {
      this.init()
    }

  subscriptions: Subscription[] = []
  private editActionClick = new Subject<boolean>();
  editActionClick$ = this.editActionClick.asObservable();
  updateEditActionClick(click: boolean){
    this.editActionClick.next(click)
  }
  rowData:any

  init(){
    this.subscriptions.push(this.editActionClick$.pipe(
      switchMap(() => this.capitalActivitySvc.getCapitalInvestment(this.rowData.capitalID)) 
    )
    .subscribe({
      next: investments => {
        this.utilSvc.openDialog(this.rowData, 'EDIT', investments);
      },
      error: error => {
        console.error("Couldn't fetch investments for this capitalID");
      }
    }))
  }
    
  editActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {
    this.rowData =  context.rowNode?.data;
    this.updateEditActionClick(true)
  }


  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe()); 
  }
}
