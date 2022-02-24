import { Component } from '@angular/core';  
import { DataService } from './core/services/data.service';  
import { HttpClient } from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import * as moment from 'moment';
import { FilterPane } from './shared/models/FilterPaneModel';
import { Location } from '@angular/common';
import {FormGroup, FormControl} from '@angular/forms';
import { AsOfDate } from './shared/models/FilterPaneModel';
import { AccessService } from './core/services/Auth/access.service';
import { Router } from '@angular/router';

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
  searchDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  range:AsOfDate = null;
  
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
  CapitalActivityStyle: any = {};
  FacilityDetailStyle: any = {};

  constructor(private http: HttpClient,
    private dataService: DataService,
    public dialog: MatDialog,
    iconRegistry:MatIconRegistry, 
    private location:Location,
    public accessService: AccessService,
    private router:Router) {

}   

get getAccessibleTabs(){
  return this.accessService.accessibleTabs;
}

getLastBusinessDay(){
  let workday = moment();
  let day = workday.day();
  let diff = 1;  // returns yesterday
  if (day == 0 || day == 1){  // is Sunday or Monday
    diff = day + 2;  // returns Friday
  }
  return workday.subtract(diff, 'days').toDate();
}

  async fetchTabs(){
    this.accessService.accessibleTabs = await this.accessService.getTabs();
    this.router.navigate([this.lastClickedTabRoute]);
  }

  lastClickedTabRoute: string = '/accessibility';

  ngOnInit(): void { 
    this.lastClickedTabRoute = this.location.path();
    this.fetchTabs();
    this.userName=this.dataService.getCurrentUserName();

    this.filterPane.AsOfDate = false;

    this.range = {
      start: moment(this.getLastBusinessDay()).format('YYYY-MM-DD'),
      end: moment(this.getLastBusinessDay()).format('YYYY-MM-DD'),
    }

    this.searchDateRange.setValue({
      start: this.range.start,
      end: this.range.end,
    })
    
    this.getSearchDateRange();

      /** On Initial Load */
      /** If Cash Balance screen is directly loaded */
    if(this.location.path() === '/cash-balance'){
      this.updateSelection('Cash Balance')
    }
      /** If GIR Editor screen is directly loaded */
    else if(this.location.path() === '/portfolio-history'){
      this.updateSelection('Portfolio')
    }
    else if(this.location.path() === '/capital-activity'){
      this.updateSelection('Capital Activity')
    }
    else this.updateSelection('')
  }  

  logout(){  
    this.dataService.logout();  
  }  

  getSearchDateRange(){

    this.range.start = moment(this.searchDateRange.get('start').value).format("YYYY-MM-DD");
    this.range.end = moment(this.searchDateRange.get('end').value).format("YYYY-MM-DD");

    if(this.range.end === 'Invalid date')
      this.range.end = this.range.start;

    this.searchDateRange.setValue({
      start: this.range.start, 
      end: this.range.end,
    })
    
    this.dataService.changeSearchDate(this.range);
  }

  updateSelection(screen: string): void{

      /** On Subsequent Load (Dynamic) */

    this.filterPane.AsOfDate = false;
    this.GIREditorStyle = this.CashBalanceStyle = this.CapitalActivityStyle = this.FacilityDetailStyle = this.notSelectedElement;
    this.lastClickedTabRoute = this.location.path();

    if(screen === 'Portfolio'){
      this.GIREditorStyle = this.selectedElement;
    }
    else if(screen === 'Cash Balance'){
      this.filterPane.AsOfDate = true;
      this.CashBalanceStyle = this.selectedElement;
    }
    else if(screen === 'Capital Activity'){
      this.CapitalActivityStyle = this.selectedElement;
    }
    else if(screen === 'Facility Detail'){
      this.FacilityDetailStyle = this.selectedElement
    }
  }

} 