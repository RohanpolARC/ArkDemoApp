import { ActionColumnContext, AdaptableButton } from '@adaptabletools/adaptable-angular-aggrid';
import { Injectable } from '@angular/core';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { UtilService } from './util.service';

@Injectable()
export class InvestorGridUtilService {

  constructor(private capitalActivitySvc: CapitalActivityService,
    private utilSvc: UtilService) { }

  editActionColumn(button: AdaptableButton<ActionColumnContext>, context: ActionColumnContext) {
  
    let rowData =  context.rowNode?.data;
    let investments = [];
    this.capitalActivitySvc.getCapitalInvestment(rowData.capitalID).subscribe({
      next: data => {
        investments = data;
        this.utilSvc.openDialog(rowData, 'EDIT', investments);
      },
      error: error => {
        console.error("Couldn't fetch investments for this capitalID");
      }
    })
  }
}
