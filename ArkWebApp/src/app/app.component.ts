import { Component } from '@angular/core';  
import { DataService } from './core/services/data.service';  
import { HttpClient } from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';


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

  constructor(private http: HttpClient,private dataService: DataService,public dialog: MatDialog,iconRegistry:MatIconRegistry) {

}   
  
ngOnInit(): void { 
    
      
    this.userName=this.dataService.getCurrentUserName()

}  
  
  logout(){  
    this.dataService.logout();  
  }  

} 