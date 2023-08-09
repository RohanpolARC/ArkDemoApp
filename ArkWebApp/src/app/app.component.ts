import { Component } from '@angular/core';  
import { DataService } from './core/services/data.service';  
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { AccessService } from './core/services/Auth/access.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MsalUserService } from './core/services/Auth/msaluser.service';
import { MsalBroadcastService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType } from '@azure/msal-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

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
  PerformanceFeesStyle: any = {};
  FeePresetStyle: any = {};
  FixingAttributesStyle:any = {};
  RefDataManagerStyle:any = {};
  ManagementFeeStyle: any = {};
  PositionsScreenStyle: any = {};
  NetReturnsStyle: any = {};
  AUMDeltaStyle: any = {};
  MarkChangeStyle:any = {};
  ValuationStyle: any = {};
  FeeAttributionStyle: any = {};

  funds
  fundHedgings
  entities
  calcMethods
  cashflowTypes

  refDataFilter: string[];

  constructor(private http: HttpClient,
    private dataService: DataService,
    public dialog: MatDialog,
    public location:Location,
    public accessService: AccessService,
    private router:Router,
    private msalSvc: MsalUserService,
    private msalBroadcastSvc: MsalBroadcastService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon('trigger', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/trigger.svg"))
  }   

  get getAccessibleTabs(){
    return this.accessService.accessibleTabs;
  }

  fetchTabs(){
    if(!this.accessService.accessibleTabs){
      this.subscriptions.push(this.accessService.getTabs().subscribe({
        next: tabs => {
          this.accessService.accessibleTabs = tabs;
          if(sessionStorage.getItem('lastClickedTabRoute')!==null){
            this.router.navigate([ sessionStorage.getItem('lastClickedTabRoute')]);
            sessionStorage.removeItem('lastClickedTabRoute');
          }
        },
        error: error => {
          console.error("Failed to fetch accessible tabs " + error);
        }
      }))  
    }    
  }

  filterApply(){

    setTimeout(() => {
      this.dataService.changeFilterApplyBtnState(true)
      this.rightSidebarOpened = false
    }, 250)
  }

  showUserRoles(){
    alert(`Your role(s) : ${this.msalSvc.msalSvc.instance.getActiveAccount()?.idTokenClaims?.roles}`)
  }

  async login(){
    await this.msalSvc.msalSvc.instance.handleRedirectPromise().then(
      res => {
        if(res && res.account)
          this.msalSvc.msalSvc.instance.setActiveAccount(res.account);
      }
    );

    const accounts = this.msalSvc.msalSvc.instance.getAllAccounts();
    if (accounts.length === 0) {
        // No user signed in
        await this.msalSvc.msalSvc.instance.loginRedirect();
    }

  }

  ngOnInit(): void { 
    if(this.location.path()!=='/accessibility' && this.location.path()!==''){
      sessionStorage.setItem('lastClickedTabRoute',this.location.path())
    }


    this.subscriptions.push(this.msalBroadcastSvc.msalSubject$
    .subscribe((result: EventMessage) => {
      if(result.eventType === EventType.LOGIN_SUCCESS || result.eventType === EventType.SSO_SILENT_SUCCESS){

        const payload = result.payload as AuthenticationResult;
        this.msalSvc.msalSvc.instance.setActiveAccount(payload.account);
        this.fetchTabs();
        this.userName=this.dataService.getCurrentUserName();  
      }
      // if refresh token is expired the msal will redirect itself to microsoft login.
      else if(result.eventType === EventType.ACQUIRE_TOKEN_FAILURE || result.eventType === EventType.ACQUIRE_TOKEN_BY_CODE_FAILURE){
        this.msalSvc.msalSvc.loginRedirect();
        
      }
    }))

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
    else if(this.location.path() === '/fee-calculation'){
      this.updateSelection('Performance Fees')
    }
    else if(this.location.path() === '/fee-presets'){
      this.updateSelection('Fee Presets')
    }
    else if(this.location.path() === '/fixing-attributes'){
      this.updateSelection('Fixing Attributes')
    }
    else if(this.location.path() === '/ref-data-manager'){
      this.updateSelection('Ref Data Manager')
    }
    else if(this.location.path() === '/management-fee'){
      this.updateSelection('Management Fee')
    }
    else if(this.location.path() === '/positions-screen'){
      this.updateSelection('Positions Screen')
    }
    else if(this.location.path() === '/aum-delta'){
      this.updateSelection('AUM Delta')
    }
    else if(this.location.path() === '/net-returns'){
      this.updateSelection('Net Returns')
    }
    else if(this.location.path() === '/mark-changes'){
      this.updateSelection('Mark Changes')
    }
    else if(this.location.path() === '/valuation'){
      this.updateSelection('Valuation')
    }
    else if(this.location.path() === '/fee-attribution'){
      this.updateSelection('Fee Attribution')
    }
    else this.updateSelection('')
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());  
  }

  logout(){  
    this.dataService.logout();  
  }  

  updateSelection(screen: string): void{

      /** On Subsequent Load (Dynamic) */

    this.GIREditorStyle = this.CashBalanceStyle = this.CapitalActivityStyle = this.FacilityDetailStyle = this.LiquiditySummaryStyle = this.AccessControlStyle = this.PortfolioModellerStyle = this.PortfolioMappingStyle = this.UnfundedAssetsStyle = this.ContractHistoryStyle = this.PerformanceFeesStyle = this.FeePresetStyle = this.FixingAttributesStyle = this.ManagementFeeStyle = this.RefDataManagerStyle = this.PositionsScreenStyle = this.AUMDeltaStyle = this.NetReturnsStyle = this.MarkChangeStyle = this.ValuationStyle = this.FeeAttributionStyle = this.notSelectedElement;

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
      setTimeout(() => { this.filterApply() }, 250)


      this.router.navigate(['/facility-detail'])
    }
    else if(screen === 'Contract History'){

      this.ContractHistoryStyle = this.selectedElement;

      setTimeout(() => { this.filterApply() }, 250)

      this.router.navigate(['/contract-history'])
    }
    else if(screen === 'Liquidity Summary'){
      this.LiquiditySummaryStyle = this.selectedElement;
      setTimeout(() => { this.filterApply() }, 250)

      this.router.navigate(['/liquidity-summary'])
    }
    else if(screen === 'Net Returns'){
      this.NetReturnsStyle = this.selectedElement;

      this.router.navigate(['/net-returns'])
    }
    else if(screen === 'Performance Fees'){
      this.PerformanceFeesStyle = this.selectedElement;
      this.router.navigate(['/fee-calculation'])
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
    else if(screen === 'Fee Presets'){
      this.FeePresetStyle = this.selectedElement;
      this.router.navigate(['/fee-presets'])
    }
    else if(screen === 'Fixing Attributes'){
      this.FixingAttributesStyle = this.selectedElement;
      this.router.navigate(['/fixing-attributes'])
    }
    else if(screen === 'Ref Data Manager'){
      this.RefDataManagerStyle = this.selectedElement;
      this.refDataFilter = ['Attribute Fixing']
      this.router.navigate(['/ref-data-manager'])      
    }
    else if(screen === 'Management Fee'){
      this.ManagementFeeStyle = this.selectedElement;
      this.router.navigate(['/management-fee'])
    }
    else if(screen === 'Positions Screen'){
      this.PositionsScreenStyle = this.selectedElement;
      this.router.navigate(['/positions-screen'])
    }
    else if(screen === 'AUM Delta'){
      this.AUMDeltaStyle = this.selectedElement;
      this.router.navigate(['/aum-delta'])
    }
    else if(screen === 'Mark Changes'){
      this.MarkChangeStyle = this.selectedElement;
      this.router.navigate(['/mark-changes'])
    }
    else if(screen === 'Valuation'){
      this.ValuationStyle = this.selectedElement;
      this.router.navigate(['/valuation'])
    }
    else if(screen === 'Fee Attribution'){
      this.FeeAttributionStyle = this.selectedElement;
      this.router.navigate(['/fee-attribution'])
    }
  }
}