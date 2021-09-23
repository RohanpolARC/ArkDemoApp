import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DataService } from '../data.service';  
import { HttpClient } from '@angular/common/http';
import {AppComponent} from '../app.component'
import {Observable} from 'rxjs';


@Component({
  selector: 'app-add-asset-gir',
  templateUrl: './add-asset-gir.component.html',
  styleUrls: ['./add-asset-gir.component.scss']
})
export class AddAssetGirComponent implements OnInit {

  public issuerAssetList: any;
  public filteredList:Observable<string[]>;;


  constructor(private http: HttpClient,private dataService: DataService,private formBuilder:FormBuilder) {  }

  assetGirForm = this.formBuilder.group({

    wsoAssetid : [''],
    asOfDate : [''],
    rate : [''],
    ccyName : [''],
    text : ['']

  })


  saveForm(){
    console.log(this.assetGirForm.value)

    let saveObject = this.assetGirForm.value

    saveObject.id= 0;
    saveObject.last_update=new Date();
    saveObject.createdBy=this.dataService.getCurrentUserName()
    saveObject.modifiedBy=this.dataService.getCurrentUserName(),
    saveObject.createdOn=new Date(),
    saveObject.modifiedOn=new Date()


    this.http.post<any>('https://localhost:44366/api/AssetGIR/put',saveObject).subscribe({
      next: data => {
          console.log(data)
         // refreshGrid();

      },
      error: error => {
         
          console.error('There was an error!', error);
      }
  })


  }

  

  ngOnInit(): void {

   this.http.get<any[]>('https://localhost:44366/api/issuerassetlist/getdata').subscribe({
      next: data => {
        this.issuerAssetList=data
         // refreshGrid();

      },
      error: error => {
         
          console.error('There was an error!', error);
      }
  });

    //console.log(issuerAssetList)



  }

}
