import { Component } from '@angular/core';  
import { DataService } from './core/services/data.service';  
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  AumReportStyle: any = {};
  PortfolioPositionCashflowStyle: any = {};
  MarketValueDeltaStyle: any = {};
  EqualisationPortfolioHistoryStyle: any = {};
  EqualisationPositionCashflowsStyle: any = {};

  funds
  fundHedgings
  entities
  calcMethods
  cashflowTypes

  refDataFilter: string[];
  isMsalInstanceInitialized:boolean = false;

  constructor(private http: HttpClient,
    private dataService: DataService,
    public dialog: MatDialog,
    public location:Location,
    private router:Router,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon('trigger', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/trigger.svg"))
  }   

  filterApply(){

    setTimeout(() => {
      this.dataService.changeFilterApplyBtnState(true)
      this.rightSidebarOpened = false
    }, 250)
  }


  ngOnInit(): void { 
  
    if(this.location.path() === '/market-value-delta'){
      this.updateSelection('Market Value Delta')
    }
    else this.updateSelection('')
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());  
  }

 

  updateSelection(screen: string): void{

      /** On Subsequent Load (Dynamic) */

    this.MarketValueDeltaStyle = this.notSelectedElement;

   
    if(screen === 'Market Value Delta'){
      this.MarketValueDeltaStyle = this.selectedElement;
      this.router.navigate(['/market-value-delta'])
    }
  
  }
}