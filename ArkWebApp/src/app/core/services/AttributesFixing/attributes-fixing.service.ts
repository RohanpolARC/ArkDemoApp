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

  public getFixingTypes(){
    return this.http.get(`${APIConfig.FIXING_TYPES_GET_API}`)
  }

  public putFixingDetails(model){
    return this.http.post(`${APIConfig.FIXING_TYPES_PUT_API}`, model);
  }
}

