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
import { MsalUserService } from './core/services/Auth/msaluser.service';
import { getLastBusinessDay } from './shared/functions/utilities';

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
    TextValueSelect: false,
    NumberField: false
  };

  searchDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  range:AsOfDateRange = null;
  asOfDate: string = null;
  numberField: number = null;

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
  AccessControlStyle: any = {};
  PortfolioModellerStyle: any = {};
  PortfolioMappingStyle: any = {};
  UnfundedAssetsStyle: any = {};

  constructor(private http: HttpClient,
    private dataService: DataService,
    public dialog: MatDialog,
    iconRegistry:MatIconRegistry, 
    public location:Location,
    public accessService: AccessService,
    private router:Router,
    private facilityDetailSvc: FacilityDetailService,
    private msalSvc: MsalUserService
  ) {}   

  get getAccessibleTabs(){
    return this.accessService.accessibleTabs;
  }

  fetchTabs(){
    if(!this.accessService.accessibleTabs){
      this.subscriptions.push(this.accessService.getTabs().subscribe({
        next: tabs => {
          this.accessService.accessibleTabs = tabs;
          this.router.navigate([this.lastClickedTabRoute]);
        },
        error: error => {
          console.error("Failed to fetch accessible tabs " + error);
        }
      }))  
    }    
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
        this.dropdownData = fundHedgings;

        this.selectedDropdownData = [];
        for(let i: number = 0; i < fundHedgings.length; i+= 1){
          if(String(fundHedgings[i]['fundHedging']).toUpperCase().includes('DL3')){
            this.selectedDropdownData.push(fundHedgings[i]);
          }
        } 
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

      this.asOfDate = moment(this.asOfDate).format('YYYY-MM-DD');
      this.dataService.changeSearchTextValues(this.selectedDropdownData.map(x => x['fund']))
      this.dataService.changeSearchDate(this.asOfDate);

      this.dataService.changeFilterApplyBtnState(true);
    }

    if(this.location.path() === '/liquidity-summary'){

      this.asOfDate = moment(this.asOfDate).format('YYYY-MM-DD');
      this.dataService.changeSearchDate(this.asOfDate);
      this.dataService.changeSearchTextValues(this.selectedDropdownData.map(x => x['fundHedging']))
      this.dataService.changeNumberField(this.numberField)
      this.dataService.changeFilterApplyBtnState(true);
    }

    if(['/irr/portfoliomodeller'].includes(this.location.path())){
      setTimeout(() => {
        this.asOfDate = moment(this.asOfDate).format('YYYY-MM-DD');
        this.dataService.changeSearchDate(this.asOfDate);
        this.dataService.changeSearchTextValues(this.selectedDropdownData.map(x => x['rule']));
        this.dataService.changeFilterApplyBtnState(true);
  
      }, 1350)
    }

    this.rightSidebarOpened = false
  }

  showUserRoles(){
    alert(`Your role(s) : ${this.msalSvc.getCurrentUserInfo().idToken['roles']}`)
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
      this.updateSelection('GIREditor')
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
    else if(this.location.path() === '/access-control'){
      this.updateSelection('Access Control')
    }
    /** If IRR is direclty loaded */
    else if(this.location.path() === '/irr/portfoliomodeller'){
      this.updateSelection('Portfolio Modeller')
    }
    else if(this.location.path() === '/portfolio-mapping'){
      this.updateSelection('Portfolio Mapping')
    }
    else if(this.location.path() === '/unfunded-assets'){
      this.updateSelection('Unfunded Assets')
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
    this.filterPane.NumberField = false;

    this.multiSelectPlaceHolder = null;
    this.dropdownSettings = null;
    this.dropdownData = [];
    this.selectedDropdownData = [];

    this.dataService.changeSearchDate(null);
    this.dataService.changeSearchDateRange(null);
    this.dataService.changeSearchTextValues(null);
    this.dataService.changeNumberField(null);
    
    this.GIREditorStyle = this.CashBalanceStyle = this.CapitalActivityStyle = this.FacilityDetailStyle = this.LiquiditySummaryStyle = this.AccessControlStyle = this.PortfolioModellerStyle = this.PortfolioMappingStyle = this.UnfundedAssetsStyle = this.notSelectedElement;

    this.lastClickedTabRoute = this.location.path();

    if(screen === 'GIREditor'){
      this.GIREditorStyle = this.selectedElement;
      this.router.navigate(['/portfolio-history']);
    }
    else if(screen === 'Cash Balance'){
      this.filterPane.AsOfDateRange = true;
      this.range = {
        start: moment(getLastBusinessDay()).format('YYYY-MM-DD'),
        end: moment(getLastBusinessDay()).format('YYYY-MM-DD'),
      }

      this.searchDateRange.setValue({
        start: this.range.start,
        end: this.range.end,
      })
      this.getSearchDateRange();
      this.CashBalanceStyle = this.selectedElement;
      this.router.navigate(['/cash-balance']);
    }
    else if(screen === 'Capital Activity'){
      this.CapitalActivityStyle = this.selectedElement;
      this.router.navigate(['/capital-activity']);
    }
    else if(screen === 'Facility Detail'){
      this.filterPane.AsOfDate = true;
      this.filterPane.TextValueSelect = true;

      this.FacilityDetailStyle = this.selectedElement

      this.multiSelectPlaceHolder = 'Select Fund(s)'

      this.asOfDate = moment(getLastBusinessDay()).format('YYYY-MM-DD')
      
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
        this.router.navigate(['/facility-detail']);

    }
    else if(screen === 'Liquidity Summary'){

      this.filterPane.AsOfDate = true;
      this.filterPane.TextValueSelect = true;
      this.filterPane.NumberField = true;

      this.LiquiditySummaryStyle = this.selectedElement;

      this.multiSelectPlaceHolder = 'Select FundHedging(s)';
      this.asOfDate = moment(getLastBusinessDay()).format('YYYY-MM-DD')
      this.numberField = 10;

      this.fetchFundHedgingsRef();

      this.dropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'fundHedging',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',
        itemsShowLimit: 2,
        allowSearchFilter: true,
        
      };
      this.router.navigate(['/liquidity-summary'])
    }
    else if(screen === 'Portfolio Modeller'){
      this.PortfolioModellerStyle = this.selectedElement;
      this.filterPane.AsOfDate = true;
      this.filterPane.TextValueSelect = false;

      this.asOfDate = moment(getLastBusinessDay()).format('YYYY-MM-DD')
      this.filterApply();
      this.router.navigate(['/irr/portfoliomodeller'])
    }
    else if(screen === 'Portfolio Mapping'){
      this.PortfolioMappingStyle = this.selectedElement
      this.router.navigate(['/portfolio-mapping'])
    }
    else if(screen === 'Unfunded Assets'){
      this.UnfundedAssetsStyle = this.selectedElement
      this.router.navigate(['/unfunded-assets'])
    }
    else if(screen === 'Access Control'){
      this.AccessControlStyle = this.selectedElement;
      this.router.navigate(['/access-control'])
    }
  }

} 