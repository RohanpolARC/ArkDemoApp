import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';

@Injectable({
  providedIn: 'root'
})
export class AttributesFixingService {

  constructor(
    private http:HttpClient
  ) { }

  public getFixingDetails(){
    return this.http.get(`${APIConfig.FIXING_DETAILS_GET_API}`)
  }

}

