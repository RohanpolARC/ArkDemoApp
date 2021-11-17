import { Component } from '@angular/core';  
import { DataService } from './core/services/data.service';  
import { HttpClient } from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import * as moment from 'moment';
import { FilterPane } from './shared/models/FilterPaneModel';
import { Location } from '@angular/common';

@Component({  
  selector: 'app-root',  
  templateUrl: './app.component.html',  
  styleUrls: ['./app.component.scss']  
})  
export class AppComponent {  
  title = 'ARK';  

  public userName:string;
  public rightSidebarOpened:boolean=false;
  public leftSIdebarOpened:boolean=false;

  //Filter Pane 
  searchDate: Date = null;
  filterPane:FilterPane = {
    AsOfDate: false,
  };

  notSelectedElement = {

    'color':'white', 
    'font-weight':'bold',
    'font-size': '15px',
    'font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    'cursor': 'pointer'
  }

  selectedElement = {
    'background-color':'#102439', 
    'color':'white', 
    'font-weight':'bold',
    'font-size': '15px',
    'font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    'cursor': 'pointer'
  }

  GIREditorStyle: any = {};
  CashBalanceStyle: any = {};

  constructor(private http: HttpClient,private dataService: DataService,public dialog: MatDialog,iconRegistry:MatIconRegistry, private location:Location) {

}   
  
  ngOnInit(): void { 
    this.userName=this.dataService.getCurrentUserName();

    this.filterPane.AsOfDate = false;

    this.searchDate = new Date();
    this.getSearchDate(this.searchDate);


    // this.searchDate = moment('2021-05-26', 'YYYY-MM-DD').toDate();
    // this.getSearchDate(moment('2021-05-26', 'YYYY-MM-DD').toDate());

      /** On Initial Load */
      /** If Cash Balance screen is directly loaded */
    if(this.location.path() === '/cash-balance'){
      this.filterPane.AsOfDate = true;
      this.CashBalanceStyle = this.selectedElement;
      this.GIREditorStyle = this.notSelectedElement;
    }
      /** If GIR Editor screen is directly loaded */
    else if(this.location.path() === ''){
      this.filterPane.AsOfDate = false;
      this.GIREditorStyle = this.selectedElement;
      this.CashBalanceStyle = this.notSelectedElement;
    }
  }  

  logout(){  
    this.dataService.logout();  
  }  

  getSearchDate(date){
    let requestedDate:string = moment(date).format("YYYY-MM-DD"); 
    this.dataService.changeSearchDate(requestedDate);
  }

  updateFilterPane(screen: string): void{

      /** On Subsequent Load (Dynamic) */

    if(screen === 'Portfolio'){
      this.filterPane.AsOfDate = false;
      this.GIREditorStyle = this.selectedElement;
      this.CashBalanceStyle = this.notSelectedElement;
    }
    else if(screen === 'Cash Balance'){
      this.filterPane.AsOfDate = true;
      this.CashBalanceStyle = this.selectedElement;
      this.GIREditorStyle = this.notSelectedElement;
    }
  }

} 