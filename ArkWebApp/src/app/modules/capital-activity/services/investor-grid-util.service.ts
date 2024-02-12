import { ActionColumnContext, AdaptableButton } from '@adaptabletools/adaptable-angular-aggrid';
import { Injectable } from '@angular/core';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { UtilService } from './util.service';
import { take } from 'rxjs/operators';
import { ConfigurationService } from './configuration.service';

@Injectable()
export class InvestorGridUtilService {

  constructor(private capitalActivitySvc: CapitalActivityService,
    private utilSvc: UtilService,
    private configSvc: ConfigurationService
    ) { }

  editActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext,args:boolean[]) {
    
    let isLocked = this.hideEditActionColumn(button,context)

    let rowData =  context.rowNode?.data;
    let investments = []; 
    this.capitalActivitySvc.getCapitalInvestment(rowData.capitalID).pipe(
      take(1)
    ).subscribe({
      next: data => {
        investments = data;
        this.utilSvc.openDialog(rowData, 'EDIT', investments, isLocked);
      },
      error: error => {
        console.error("Couldn't fetch investments for this capitalID");
      }
    })
  }

  hideEditActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext){
    let rowData = context.rowNode?.data;
    return new Date(rowData?.valueDate) <= new Date(this.configSvc.config?.lockDate)
  }

  hideLockActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext){
    let rowData = context.rowNode?.data;
    return new Date(rowData?.valueDate) > new Date(this.configSvc.config?.lockDate)
  }

  showHideLockIcon(params){
    if(new Date(params.node?.data?.valueDate) <= new Date(this.configSvc.config?.lockDate))
      return '<span><img src="../assets/img/lock.svg"></span>'
    else
      return ''
  }
  

}
