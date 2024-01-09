import { BodyScrollEvent, GridApi, GridOptions } from "@ag-grid-community/core";
import { Injectable } from "@angular/core";
import { ScrollPosition } from "src/app/shared/models/IRRCalculationsModel";
import { PortfolioModellerService } from "./portfolio-modeller.service";
import { filter } from "rxjs/operators";
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

    constructor(
        private portfolioModellerService:PortfolioModellerService
    ){ 
        console.log(this.parentTabIndex +" "+this.childTabIndex)
        this.portfolioModellerService.tabGroupSelected$.pipe(
            filter(x => x.parentTabSelectedIndex == this.parentTabIndex && x.childTabSelectedIndex==this.childTabIndex)
        )    
        .subscribe(() => {
            if(this.scrollPosition && this.gridApi){
                this.updateAgGridLastScrollPosition()
            }
            
        })
    }

    updateAgGridLastScrollPosition(){
        this.gridApi?.ensureIndexVisible(this.scrollPosition?.lastScrollPositionVertical, null);
        this.gridApi?.ensureColumnVisible(this.scrollPosition?.lastScrollPositionHorizontal,"start");
    }

    onAgGridScroll(event:BodyScrollEvent){
        this.scrollPosition.lastScrollPositionVertical = event.api.getLastDisplayedRow()
        
        if(event.columnApi.getAllDisplayedColumns()[0].getColId() == event.columnApi.getAllDisplayedVirtualColumns()[0].getColId())
          this.scrollPosition.lastScrollPositionHorizontal = event.columnApi.getAllDisplayedVirtualColumns()[0].getColId()
        else
          this.scrollPosition.lastScrollPositionHorizontal = event.columnApi.getAllDisplayedVirtualColumns()[1].getColId()
    }


    // scrollPosition: ScrollPosition = {
    //     lastScrollPositionVertical:0,    
    //     lastScrollPositionHorizontal:null
    // }
    // parentTabIndex: number = 0;
    // childTabIndex: number = 0;
    // gridApi: GridApi
    // lastScrollPositions = new Map<number, Map<number, ScrollPosition>>();

    // constructor(
    //     private portfolioModellerService:PortfolioModellerService
    // ){ 
    //     console.log(this.parentTabIndex +" "+this.childTabIndex)
    //     this.portfolioModellerService.tabGroupSelected$.pipe(
    //         filter(x => x.parentTabSelectedIndex == this.parentTabIndex && x.childTabSelectedIndex==this.childTabIndex)
    //     )    
    //     .subscribe(() => {
    //         let lastScrollPosition:ScrollPosition = this.getLastScrollPositions(this.parentTabIndex, this.childTabIndex)
    //         if(lastScrollPosition && this.gridApi){            
    //             this.updateAgGridLastScrollPosition(lastScrollPosition)
    //         }
    //     })
    // }

    // updateAgGridLastScrollPosition(lastScrollPosition:ScrollPosition){
    //     this.gridApi.ensureIndexVisible(lastScrollPosition.lastScrollPositionVertical, null);
    //     this.gridApi.ensureColumnVisible(lastScrollPosition.lastScrollPositionHorizontal,"start");
    // }

    // updateLastScrollPositions(parentTabIndex:number, childTabIndex:number, scrollPosition:ScrollPosition){
    //     if(this.lastScrollPositions.get(parentTabIndex))
    //         this.lastScrollPositions.get(parentTabIndex).set(childTabIndex, scrollPosition)
    //     else
    //         this.lastScrollPositions.set(parentTabIndex,new Map().set(childTabIndex, scrollPosition))
    // }

    // getLastScrollPositions(parentTabIndex:number, childTabIndex:number){
    //     return this.lastScrollPositions?.get(parentTabIndex)?.get(childTabIndex)
    // }

    // onAgGridScroll(event:BodyScrollEvent){
    //     this.scrollPosition.lastScrollPositionVertical = event.api.getLastDisplayedRow()
        
    //     if(event.columnApi.getAllDisplayedColumns()[0].getColId() == event.columnApi.getAllDisplayedVirtualColumns()[0].getColId())
    //       this.scrollPosition.lastScrollPositionHorizontal = event.columnApi.getAllDisplayedVirtualColumns()[0].getColId()
    //     else
    //       this.scrollPosition.lastScrollPositionHorizontal = event.columnApi.getAllDisplayedVirtualColumns()[1].getColId()

    //     this.updateLastScrollPositions(this.parentTabIndex, this.childTabIndex, this.scrollPosition)
    // }

    

}