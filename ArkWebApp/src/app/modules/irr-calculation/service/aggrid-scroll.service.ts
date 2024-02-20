import { BodyScrollEvent, Column, GridApi, GridOptions } from "@ag-grid-community/core";
import { Injectable } from "@angular/core";
import { ScrollPosition } from "src/app/shared/models/IRRCalculationsModel";
import { PortfolioModellerService } from "./portfolio-modeller.service";
import { filter, tap } from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
// This Service is to retain the AgGrid's Last Scroll Positions on Parent and Child Angular MatTab Changed event
// This service has to be injected on Component level to maintain and retain last scroll position of grid each MatTab component
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
                if(!(x.parentTabSelectedIndex == this.parentTabIndex && x.childTabSelectedIndex==this.childTabIndex)){
                    this.allowAgGridScrollEvent = false;
                }
            }),
            filter(x => x.parentTabSelectedIndex == this.parentTabIndex && x.childTabSelectedIndex==this.childTabIndex)
        )    
        .subscribe(() => {
            if(this.scrollPosition && this.gridApi){
                
                this.updateAgGridLastScrollPosition()                
                this.allowAgGridScrollEvent = true;
            }
            
        })
    }

    updateAgGridLastScrollPosition(){
        this.gridApi?.ensureIndexVisible(this.scrollPosition?.lastScrollPositionVertical, null);
        this.gridApi?.ensureColumnVisible(this.scrollPosition?.lastScrollPositionHorizontal,"start");
    }

    onAgGridScroll(event:BodyScrollEvent){
        if(this.allowAgGridScrollEvent){       
            let agGridVirtualColumns:Column[] = event.columnApi.getAllDisplayedVirtualColumns()
            this.scrollPosition.lastScrollPositionVertical = event.api.getLastDisplayedRow()
        
            // agGridVirtualColumns always has 2 columns as buffer columns additional than the columns visible on the grid viewports
            // we are adjusting the scroll position to get column id which is just visible on the grid by setting scroll position to agGridVirtualColumns[2]
            // Exceptional case with scroll postion as the first column, it doesn't have column buffer so setting scroll position to agGridVirtualColumns[0] 
            if(event.columnApi.getAllDisplayedColumns()[0].getColId() == agGridVirtualColumns[0].getColId())
                this.scrollPosition.lastScrollPositionHorizontal = agGridVirtualColumns[0].getColId()
            else
                this.scrollPosition.lastScrollPositionHorizontal = agGridVirtualColumns[2].getColId()
        }       
    }
}