import { CellClickedEvent, CellStyle } from '@ag-grid-community/core';
import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { formatDate } from 'src/app/shared/functions/formatter';
import { DetailedView } from 'src/app/shared/models/GeneralModel';
import { DefaultDetailedViewPopupComponent } from 'src/app/shared/modules/detailed-view/default-detailed-view-popup/default-detailed-view-popup.component';
import { ComponentReaderService } from './component-reader.service';
import { CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';
import { DataService } from 'src/app/core/services/data.service';
import { UtilService } from './util.service';

@Injectable()
export class InvestmentGridUtilService implements OnDestroy {

  constructor(private dialog: MatDialog,
    private capitalActivitySvc: CapitalActivityService,
    private compReaderSvc: ComponentReaderService,
    private dataSvc: DataService,
    private utilSvc: UtilService) { 

      this.initListeners()  
    }

  subscriptions: Subscription[] = []
  onTotalBaseClick(event: CellClickedEvent){
    if(event.node.group){
 
      let leafNodes: any[] = event.node.allLeafChildren.map(row => row?.['data']);      
      let pIDcashDtTypeStr: string = '';
      leafNodes.forEach(investment => {
        pIDcashDtTypeStr += `${investment.positionID}|${formatDate(investment.cashDate, true)}:${investment.type},`
      })
      
      if(pIDcashDtTypeStr.length)
        pIDcashDtTypeStr = pIDcashDtTypeStr.slice(0, -1);
  
      let model: DetailedView = <DetailedView> {};
      model.screen = 'Investment Cashflows';
      model.param1 = pIDcashDtTypeStr;
      model.param2 = model.param3 = model.param4 = model.param5 = '';
      model.strParam1 = [];

      const dialogRef = this.dialog.open(DefaultDetailedViewPopupComponent, {
        data: {
          detailedViewRequest: model,
          failureMsg: leafNodes.length > 50 ? `Please select group having lesser child rows (Max 50)` : null,
          noFilterSpace: true,
          grid: 'Investment Cashflows'
        },
        width: '90vw',
        height: '80vh'
      })

    }
  }

  processLinking(){
    let nodes: CapitalInvestment[] = this.compReaderSvc.investmentGridApi().getSelectedNodes()?.map(node => node.data);
    let validity: string = this.validateLinking(nodes);

    if(validity){
      this.dataSvc.setWarningMsg(validity, `Dismiss`, `ark-theme-snackbar-warning`)
    }
    else {
      this.utilSvc.openDialog(nodes, 'LINK-ADD');
    }
  }

  validateLinking(nodes: CapitalInvestment[]): string {

    let fundhedgings: string[] = [...new Set(nodes.map(node => <string>node?.['fundHedging'] ))] || []
    let cnt: number = fundhedgings.length;
    if(cnt > 1)
      return 'Cannot link multiple fundhedgings to a new capital activity in this mode';
    else if(cnt === 0)
      return 'Please select investments to link first';
    else if(cnt === 1)
      return ''
    else
      throw Error('Validate linking failed');
  }

  initListeners(){

    this.subscriptions.push(
      this.capitalActivitySvc.linkEvent$
        .pipe(filter((link: boolean) => link))
        .subscribe((link: boolean) => {
          this.processLinking();
    }))
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe);  
  }

  cellStyle (params) {
    if(params.node.group)
      return { color: '#0590ca' };
    return null;
  }

  tooltipValueGetter (params) {
    return 'Open detailed view'
  }

}