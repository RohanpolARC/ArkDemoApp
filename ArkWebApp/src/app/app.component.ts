import { Component } from '@angular/core';  
import { DataService } from './core/services/data.service';  
import { HttpClient } from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import * as moment from 'moment';
import { FilterPane } from './shared/models/FilterPaneModel';
import { Location } from '@angular/common';
import {FormGroup, FormControl} from '@angular/forms';
import { AsOfDateRange } from './shared/models/FilterPaneModel';
import { AccessService } from './core/services/Auth/access.service';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subscription } from 'rxjs';
import { FacilityDetailService } from './core/services/FacilityDetails/facility-detail.service';
import { LiquiditySummaryService } from './core/services/LiquiditySummary/liquidity-summary.service';

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
    AsOfDateRange: false,
    AsOfDate: false,
    TextValueSelect: false
  };

  searchDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  range:AsOfDateRange = null;
  asOfDate: string = null;

  multiSelectPlaceHolder: string = null;
  dropdownSettings: IDropdownSettings = null;
  dropdownData: any = null;
  selectedDropdownData: any = null;

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
  LiquiditySummaryStyle: any = {};

  constructor(private http: HttpClient,
    private dataService: DataService,
    public dialog: MatDialog,
    iconRegistry:MatIconRegistry, 
    public location:Location,
    public accessService: AccessService,
    private router:Router,
    private facilityDetailSvc: FacilityDetailService
  ) {}   

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

  fetchFacilityFunds(){
    this.subscriptions.push(this.facilityDetailSvc.getFacilityFunds().subscribe({
      next: funds => {
        this.dropdownData = this.selectedDropdownData = funds;


        //   /**  Fetching details after getting funds*/
                  // Apply on load
      this.filterApply();

      },
      error: error => {
        console.error("Failed to get funds for filtering");
      }
    }))
  }

  fetchFundHedgingsRef(){
    this.subscriptions.push(this.dataService.getFundHedgingsRef().subscribe({
      next: fundHedgings => {
        this.dropdownData = this.selectedDropdownData = fundHedgings;

                  // Apply on load
      this.filterApply();

      },
      error: error => {
        console.error("Failed to get fund hedgings for filtering")
      }
    }))
  }

  filterApply(){
    if(this.location.path() === '/facility-detail'){
      // this.setFacilityFilter();

      this.asOfDate = moment(this.asOfDate).format('YYYY-MM-DD');
      this.dataService.changeSearchTextValues(this.selectedDropdownData.map(x => x['fund']))
      this.dataService.changeSearchDate(this.asOfDate);

      this.dataService.changeFilterApplyBtnState(true);
    }

    if(this.location.path() === '/liquidity-summary'){

      this.asOfDate = moment(this.asOfDate).format('YYYY-MM-DD');
      this.dataService.changeSearchDate(this.asOfDate);
      this.dataService.changeSearchTextValues(this.selectedDropdownData.map(x => x['fundHedging']))
      this.dataService.changeFilterApplyBtnState(true);
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
    /** If Liquidity Summary is directly loaded */
    else if(this.location.path() === '/liquidity-summary'){
      this.updateSelection('Liquidity Summary')
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
    
    this.dataService.changeSearchDateRange(this.range);

    if(this.location.path() === '/cash-balance'){
      this.rightSidebarOpened = false
    }
  }

  updateSelection(screen: string): void{

      /** On Subsequent Load (Dynamic) */

    this.filterPane.AsOfDateRange = false;
    this.filterPane.AsOfDate = false;
    this.filterPane.TextValueSelect = false;

    this.GIREditorStyle = this.CashBalanceStyle = this.CapitalActivityStyle = this.FacilityDetailStyle = this.LiquiditySummaryStyle = this.notSelectedElement;
    this.lastClickedTabRoute = this.location.path();

    if(screen === 'Portfolio'){
      this.GIREditorStyle = this.selectedElement;
    }
    else if(screen === 'Cash Balance'){
      this.filterPane.AsOfDateRange = true;
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
      this.filterPane.AsOfDate = true;
      this.filterPane.TextValueSelect = true;

      this.FacilityDetailStyle = this.selectedElement

      this.multiSelectPlaceHolder = 'Select Fund(s)'

      this.asOfDate = moment(this.getLastBusinessDay()).format('YYYY-MM-DD')
      
      this.fetchFacilityFunds();

      this.dropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'fund',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',
        itemsShowLimit: 2,
        allowSearchFilter: true,
        
      };

    }
    else if(screen === 'Liquidity Summary'){

      this.filterPane.AsOfDate = true;
      this.filterPane.TextValueSelect = true;

      this.LiquiditySummaryStyle = this.selectedElement;

      this.multiSelectPlaceHolder = 'Select FundHedging(s)';
      this.asOfDate = moment(this.getLastBusinessDay()).format('YYYY-MM-DD')

      this.fetchFundHedgingsRef();

      this.range = {
        start: moment(this.getLastBusinessDay()).format('YYYY-MM-DD'),
        end: moment(this.getLastBusinessDay()).format('YYYY-MM-DD'),
      }

      this.searchDateRange.setValue({
        start: this.range.start,
        end: this.range.end,
      })

      this.dropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'fundHedging',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',
        itemsShowLimit: 2,
        allowSearchFilter: true,
        
      };

    }
  }

} 