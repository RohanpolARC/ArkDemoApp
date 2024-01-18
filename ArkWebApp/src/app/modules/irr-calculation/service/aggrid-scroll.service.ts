import { BodyScrollEvent, GridApi, GridOptions } from "@ag-grid-community/core";
import { Injectable } from "@angular/core";
import { ScrollPosition } from "src/app/shared/models/IRRCalculationsModel";
import { PortfolioModellerService } from "./portfolio-modeller.service";
import { filter, tap } from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
// This Service is to retain the AgGrid's Last Scroll Positions on Parent and Child Angular MatTab Changed event
// This service has to be injected on Component level to maintain and retain last scroll position of each MatTab component
export class AgGridScrollService{
    scrollPosition: ScrollPosition = {
        lastScrollPositionVertical:0,    
        lastScrollPositionHorizontal:null
    }
    parentTabIndex: number = 0;
    childTabIndex: number = 0;
    gridApi: GridApi
    allowAgGridScrollEvent: boolean = false;

    constructor(
        private portfolioModellerService:PortfolioModellerService
    ){ 
        this.portfolioModellerService.tabGroupSelected$.pipe(
            tap(x => {
                if(x.parentTabSelectedIndex != this.parentTabIndex && x.childTabSelectedIndex!=this.childTabIndex){
                    this.allowAgGridScrollEvent = false;
                }
            }),
            filter(x => x.parentTabSelectedIndex == this.parentTabIndex && x.childTabSelectedIndex==this.childTabIndex)
        )    
        .subscribe(() => {
            if(this.scrollPosition && this.gridApi){
                
                this.allowAgGridScrollEvent = true;
                this.updateAgGridLastScrollPosition()
            }
            
        })
    }

    updateAgGridLastScrollPosition(){
        this.gridApi?.ensureIndexVisible(this.scrollPosition?.lastScrollPositionVertical, null);
        this.gridApi?.ensureColumnVisible(this.scrollPosition?.lastScrollPositionHorizontal,"start");
    }

    onAgGridScroll(event:BodyScrollEvent){
        console.log(event)
        // if(!(event.columnApi.getAllDisplayedColumns()[0].getColId() == event.columnApi.getAllDisplayedVirtualColumns()[0].getColId()
        //  && event.api.getFirstDisplayedRow() == 0)
        // ){
        if(this.allowAgGridScrollEvent){        
            this.scrollPosition.lastScrollPositionVertical = event.api.getLastDisplayedRow()
        
            if(event.columnApi.getAllDisplayedColumns()[0].getColId() == event.columnApi.getAllDisplayedVirtualColumns()[0].getColId())
            this.scrollPosition.lastScrollPositionHorizontal = event.columnApi.getAllDisplayedVirtualColumns()[0].getColId()
            else
            this.scrollPosition.lastScrollPositionHorizontal = event.columnApi.getAllDisplayedVirtualColumns()[2].getColId()
        }
        // }        
    }
}