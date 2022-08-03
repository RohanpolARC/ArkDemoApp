import { Component } from '@angular/core';  
import { DataService } from './core/services/data.service';  
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { AccessService } from './core/services/Auth/access.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MsalUserService } from './core/services/Auth/msaluser.service';

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
  ContractHistoryStyle: any = {};

  funds
  fundHedgings

  constructor(private http: HttpClient,
    private dataService: DataService,
    public dialog: MatDialog,
    public location:Location,
    public accessService: AccessService,
    private router:Router,
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

  filterApply(){

    setTimeout(() => {
      this.dataService.changeFilterApplyBtnState(true)
      this.rightSidebarOpened = false
    }, 250)
  }

  showUserRoles(){
    alert(`Your role(s) : ${this.msalSvc.getCurrentUserInfo().idToken['roles']}`)
  }

  ngOnInit(): void { 

    this.lastClickedTabRoute = this.location.path();
    this.fetchTabs();
    this.userName=this.dataService.getCurrentUserName();

      /** On Initial Load (If screen is directly loaded from the url)*/
      /** If Cash Balance screen is directly loaded */
    if(this.location.path() === '/cash-balance'){
      this.updateSelection('Cash Balance')
    }
    else if(this.location.path() === '/portfolio-history'){
      this.updateSelection('GIREditor')
    }
    else if(this.location.path() === '/capital-activity'){
      this.updateSelection('Capital Activity')
    }
    else if(this.location.path() === '/facility-detail'){
      this.updateSelection('Facility Detail')
    }
    else if(this.location.path() === '/liquidity-summary'){
      this.updateSelection('Liquidity Summary')
    }
    else if(this.location.path() === '/access-control'){
      this.updateSelection('Access Control')
    }
    else if(this.location.path() === '/irr/portfoliomodeller'){
      this.updateSelection('Portfolio Modeller')
    }
    else if(this.location.path() === '/portfolio-mapping'){
      this.updateSelection('Portfolio Mapping')
    }
    else if(this.location.path() === '/unfunded-assets'){
      this.updateSelection('Unfunded Assets')
    }
    else if(this.location.path() === '/contract-history'){
      this.updateSelection('Contract History')
    }
    else this.updateSelection('')
  }

  logout(){  
    this.dataService.logout();  
  }  

  updateSelection(screen: string): void{

      /** On Subsequent Load (Dynamic) */

    this.GIREditorStyle = this.CashBalanceStyle = this.CapitalActivityStyle = this.FacilityDetailStyle = this.LiquiditySummaryStyle = this.AccessControlStyle = this.PortfolioModellerStyle = this.PortfolioMappingStyle = this.UnfundedAssetsStyle = this.ContractHistoryStyle = this.notSelectedElement;

    this.lastClickedTabRoute = this.location.path();

    if(screen === 'GIREditor'){
      this.GIREditorStyle = this.selectedElement;
      this.router.navigate(['/portfolio-history']);
    }
    else if(screen === 'Cash Balance'){
      this.CashBalanceStyle = this.selectedElement;
      this.router.navigate(['/cash-balance']);
    }
    else if(screen === 'Capital Activity'){
      this.CapitalActivityStyle = this.selectedElement;
      this.router.navigate(['/capital-activity']);
    }
    else if(screen === 'Facility Detail'){

      this.FacilityDetailStyle = this.selectedElement
      this.subscriptions.push(
        this.dataService.getUniqueValuesForField('fund').subscribe({
          next: (data: any[]) => {
            this.funds = data.map(item => { return { fund: item.value, id: item.id } })
        setTimeout(() => { this.filterApply() }, 250)
      }}))

      this.router.navigate(['/facility-detail'])
    }
    else if(screen === 'Contract History'){

      this.ContractHistoryStyle = this.selectedElement;
      this.subscriptions.push(
        this.dataService.getUniqueValuesForField('fund').subscribe({
          next: (data: any[]) => {
            this.funds = data.map(item => { return { fund: item.value, id: item.id } })
        setTimeout(() => { this.filterApply() }, 250)
      }}))

      this.router.navigate(['/contract-history'])
    }
    else if(screen === 'Liquidity Summary'){
      this.LiquiditySummaryStyle = this.selectedElement;
      this.subscriptions.push(
        this.dataService.getUniqueValuesForField('fundHedging').subscribe({
          next: (data: any[]) => {
            this.fundHedgings = data.map(item => { return { fundHedging: item.value, id: item.id } })
        setTimeout(() => { this.filterApply() }, 250)
      }}))

      this.router.navigate(['/liquidity-summary'])
    }
    else if(screen === 'Portfolio Modeller'){
      this.PortfolioModellerStyle = this.selectedElement;
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