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

  FacilityDetailStyle: any = {};
  AumReportStyle: any = {};
  MarketValueDeltaStyle: any = {};
  RefDataManagerStyle: any = {};

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
    }else if(this.location.path() === '/facility-detail'){
      this.updateSelection('Facility Detail')
    }else if(this.location.path() === '/aum-report'){
      this.updateSelection('AUM Report')
    }else if(this.location.path() === '/ref-data-manager'){
      this.updateSelection('Ref Data Manager')
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
    }else if(screen === 'Facility Detail'){

      this.FacilityDetailStyle = this.selectedElement
      // setTimeout(() => { this.filterApply() }, 250)


      this.router.navigate(['/facility-detail'])
    }else if(screen === 'AUM Report'){
      this.AumReportStyle = this.selectedElement;
      this.router.navigate(['/aum-report'])
    }else if(screen === 'Ref Data Manager'){
      this.RefDataManagerStyle= this.selectedElement;
      this.router.navigate(['/ref-data-manager'])
    }
  
  }
}