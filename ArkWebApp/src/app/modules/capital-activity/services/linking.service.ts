import { Injectable } from '@angular/core';
import { ModalService } from './modal.service';
import { CapitalActivityModel, CapitalInvestment } from 'src/app/shared/models/CapitalActivityModel';
import { Observable, Subject, of } from 'rxjs';
import { CapitalActivityService } from 'src/app/core/services/CapitalActivity/capital-activity.service';
import { formatDate } from 'src/app/shared/functions/formatter';
import { switchMap, tap } from 'rxjs/operators';
import { GridApi, GridReadyEvent, RowDataUpdatedEvent, RowNode, SelectionChangedEvent } from '@ag-grid-community/core';

@Injectable()
export class LinkingService {

  lookupActivities$: Observable<any[]> = of([])
  constructor(public modalSvc: ModalService,
    private capitalActivitySvc: CapitalActivityService) {

      this.lookupActivities$ = this.lookupRefreshClick$.pipe(
        switchMap((_) => {
          let investmentData: CapitalInvestment[] = this.modalSvc.investmentData;

          let positionIDCashdateTypeStr: string = '';
          investmentData?.forEach((inv: CapitalInvestment) => {
              positionIDCashdateTypeStr += `${inv.positionID}|${formatDate(inv.cashDate, true)}:${inv.type},`
          })
          if(positionIDCashdateTypeStr.length)
            positionIDCashdateTypeStr = positionIDCashdateTypeStr.slice(0, -1)
      
          let lookup: CapitalActivityModel = {... this.modalSvc.capitalActivity }
          lookup.positionIDCashdateTypeStr = positionIDCashdateTypeStr;
      
          return this.capitalActivitySvc.lookUpCapitalActivity(lookup).pipe(
            tap((lookupActivities) => { this.checkifAlreadyLinked(lookupActivities) }) 
          )
        })
      )
    }

  gridApi: GridApi
  
  private lookupRefreshClick = new Subject<boolean>();
  lookupRefreshClick$ = this.lookupRefreshClick.asObservable();
  updateLookupRefreshClick(click: boolean){
    this.lookupRefreshClick.next(click)
  }


  lookupCapitalActivities(){
    this.updateLookupRefreshClick(true);
  }

  
  checkifAlreadyLinked(lookupActivities: any[]){

    let cntLinkedActivities: number = lookupActivities?.filter(act => (act?.['resultCategory'] ?? '').trim().toLowerCase() === 'linked').length || 0;

    if(cntLinkedActivities){
      this.modalSvc.updateIsAlreadyLinked(true)
    }
    else {
      this.modalSvc.updateIsAlreadyLinked(false)
    }
  }

  onRowDataUpdated = (params: RowDataUpdatedEvent) => {
    this.selectAlreadyReviewedActivities();
  }

  selectAlreadyReviewedActivities(){

    this.gridApi.forEachLeafNode((node: RowNode) => {
      if((node.data?.['resultCategory'] || '').trim().toLowerCase() === 'linked'){
        node.setSelected(true);
      }
    })
  }
  
  onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
    this.lookupCapitalActivities();   
  }

  onSelectionChanged = (params: SelectionChangedEvent) => {
    let selectedids: number[] = params.api.getSelectedNodes()?.map(node => node?.data?.['capitalID']).filter(id => id) || [];
    this.modalSvc.updateLinkingCapitalIDs(selectedids);
  }
}