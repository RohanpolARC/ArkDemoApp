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
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subscription } from 'rxjs';
import { FacilityDetailService } from './core/services/FacilityDetails/facility-detail.service';

@Component({  
  selector: 'app-root',  
  templateUrl: './app.component.html',  
  styleUrls: ['./app.component.scss']  
})  
export class AppComponent {  
  title = 'ARK';  

  subscriptions: Subscription[] = [];

  public userName:string;
  public rightSidebarOpened:boolean=false;
  public leftSIdebarOpened:boolean=false;

  //Filter Pane 
  searchDate: Date = null;
  filterPane:FilterPane = {
    AsOfDate: false,
    Funds: false
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
    public location:Location,
    public accessService: AccessService,
    private router:Router,
    private facilityDetailSvc: FacilityDetailService) {

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

  selectedFunds = [];
  fundsDropdown = [];
  fundDropdownSettings: IDropdownSettings = {};

  fetchFacilityFunds(){
    this.subscriptions.push(this.facilityDetailSvc.getFacilityFunds().subscribe({
      next: funds => {
        this.fundsDropdown = this.selectedFunds = funds;
        this.dataService.changeSearchFunds(this.selectedFunds);
      },
      error: error => {
        console.error("Failed to get funds for filtering");
      }
    }))
  }

  onFundFilterApply(event){
    this.dataService.changeSearchFunds(this.selectedFunds)
    this.rightSidebarOpened = false
  }

  filterApply(){
    if(this.location.path() === '/facility-detail'){
      this.dataService.changeSearchFunds(this.selectedFunds)
    }
    this.rightSidebarOpened = false
  }

  ngOnInit(): void { 
    this.lastClickedTabRoute = this.location.path();
    this.fetchTabs();
    this.userName=this.dataService.getCurrentUserName();

      /** On Initial Load */
      /** If Cash Balance screen is directly loaded */
    if(this.location.path() === '/cash-balance'){
      this.updateSelection('Cash Balance')
    }
      /** If GIR Editor screen is directly loaded */
    else if(this.location.path() === '/portfolio-history'){
      this.updateSelection('Portfolio')
    }
      /** If Capital Activity is directly loaded */
    else if(this.location.path() === '/capital-activity'){
      this.updateSelection('Capital Activity')
    }
      /** If Facility Details is directly loaded */
    else if(this.location.path() === '/facility-detail'){
      this.updateSelection('Facility Detail')
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
    this.filterPane.Funds = false;
    this.GIREditorStyle = this.CashBalanceStyle = this.CapitalActivityStyle = this.FacilityDetailStyle = this.notSelectedElement;
    this.lastClickedTabRoute = this.location.path();

    if(screen === 'Portfolio'){
      this.GIREditorStyle = this.selectedElement;
    }
    else if(screen === 'Cash Balance'){
      this.filterPane.AsOfDate = true;
      this.range = {
        start: moment(this.getLastBusinessDay()).format('YYYY-MM-DD'),
        end: moment(this.getLastBusinessDay()).format('YYYY-MM-DD'),
      }

      this.searchDateRange.setValue({
        start: this.range.start,
        end: this.range.end,
      })
      this.getSearchDateRange();
      this.CashBalanceStyle = this.selectedElement;
    }
    else if(screen === 'Capital Activity'){
      this.CapitalActivityStyle = this.selectedElement;
    }
    else if(screen === 'Facility Detail'){

      this.filterPane.Funds = true;
      this.FacilityDetailStyle = this.selectedElement

      this.fetchFacilityFunds();

      this.fundDropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'fund',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',
        itemsShowLimit: 2,
        allowSearchFilter: true,
        
      };  
    }
  }

} 