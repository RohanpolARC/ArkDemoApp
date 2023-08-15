import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VirtualPositionFormComponent } from '../virtual-position-form/virtual-position-form.component';
import { VPositionModel } from 'src/app/shared/models/IRRCalculationsModel';
import { DataService } from 'src/app/core/services/data.service';
import { RefService } from '../portfolio-modeller/ref/ref.service';
import { ComponentReaderService } from './component-reader.service';
import { getDateFromStr, getMomentDateStrFormat } from 'src/app/shared/functions/utilities';

@Injectable()
export class PortfolioModellerService {
  
  constructor(
      public dialog: MatDialog,
      private dataSvc:DataService,
      public refSvc: RefService,
      private compReaderSvc: ComponentReaderService
    ) { }

  openVirtualPositionsForm(context: 'ADD' | 'UPDATE', row: any = null){
    
    if(this.refSvc.refDataLoadFailed){
      this.dataSvc.setWarningMsg("Failed to load Reference data. Try again by reloading", "Dismiss", "ark-theme-snackbar-error")
      return
    }
    
    if(!this.refSvc.isRefDataLoaded()){
      this.dataSvc.setWarningMsg("Please wait for the reference data to load", "Dismiss", "ark-theme-snackbar-warning")
      return
    }

    const dialogRef = this.dialog.open(VirtualPositionFormComponent,{
      data:{
        asOfDate: this.compReaderSvc.asOfDate(),
        context,
        row
      }
    })

    let adaptableApi = this.compReaderSvc.adaptableApi();

    dialogRef.afterClosed().subscribe({
      next:(data:{
          newPositionData:VPositionModel
          responseData:any
        })=>{
            if(data?.responseData){
              let row = data.newPositionData;

              let newRowNode = {
                positionID: data.responseData.data, //position id
                assetID:  row?.['assetID'],
                asset:  row?.['asset'],
                fundHedging:  row?.['fundHedging'],
                issuerShortName:  row?.['issuerShortName'],
                assetTypeName:  row?.['assetTypeName'],
                fund: row?.['fund'],
                fundCcy: row?.['fundCcy'],
                ccy:  row?.['ccy'],
                costPrice:  row?.['costPrice'],
                faceValueIssue: row?.['faceValueIssue'],
                entryDate: getMomentDateStrFormat(getDateFromStr(row?.['entryDate'],"YYYY-MM-DD"),'DD/MM/YYYY'),
                
                expectedDate: getMomentDateStrFormat(getDateFromStr(row?.['expectedExitDate'],"YYYY-MM-DD"),'DD/MM/YYYY'),
                globalExpectedDate: getMomentDateStrFormat(getDateFromStr(row?.['expectedExitDate'],"YYYY-MM-DD"),'DD/MM/YYYY'),
                
                expectedPrice:  row?.['expectedExitPrice'],
                globalExpectedPrice:  row?.['expectedExitPrice'],

                maturityDate: getMomentDateStrFormat(getDateFromStr(row?.['maturityDate'],'YYYY-MM-DD'),'DD/MM/YYYY'),
                globalMaturityDate: getMomentDateStrFormat(getDateFromStr(row?.['maturityDate'],'YYYY-MM-DD'),'DD/MM/YYYY'),
                
                
                benchMarkIndex: row?.['benchMarkIndex'],
                globalBenchMarkIndex: row?.['benchMarkIndex'],
                
                spread:row?.['spread'],
                globalSpread:row?.['spread'],
                
                pikMargin:row?.['pikMargin'],
                globalPikMargin:row?.['pikMargin'],
                
                unfundedMargin:row?.['unfundedMargin'],
                globalUnfundedMargin:row?.['unfundedMargin'],
                
                floorRate:row?.['floorRate'],
                globalFloorRate:row?.['floorRate'],
                
                seniority:row?.['seniority'],
                dealType: row?.['dealType'],
                dealTypeCS: row?.['dealTypeCS'],
                isVirtual: true
              }
              adaptableApi.gridApi.addOrUpdateGridData([newRowNode])
              if(data.responseData.returnMessage==='INSERT'){
                this.dataSvc.setWarningMsg("Added new virtual position","Dismiss","ark-theme-snackbar-success")
              }
              else if(data.responseData.returnMessage==='UPDATE'){
                this.dataSvc.setWarningMsg(`Updated position`,`Dismiss`,`ark-theme-snackbar-success`)
              }
            }
        }
    })
  }
}
