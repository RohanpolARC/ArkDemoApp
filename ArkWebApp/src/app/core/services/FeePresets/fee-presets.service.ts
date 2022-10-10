import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIConfig } from 'src/app/configs/api-config';

@Injectable({
  providedIn: 'root'
})
export class FeePresetsService {

  constructor(private http: HttpClient) { }

  public getFundInvestmentData(fund: string){
    return this.http.get(`${APIConfig.FEE_PRESET_INVESTMENT_GET_API}`, {
      params: {
        fundName: fund
      }
    })
  }

  public getFundFeeData(){
    return this.http.get(`${APIConfig.FEE_PRESET_DATA_GET_API}`)
  }

  public putFundInvestmentData(model){
    return this.http.post(APIConfig.FEE_PRESET_INVESTMENT_PUT_API, model)
  }

  public putFundFeeData(model){
    return this.http.post(APIConfig.FEE_PRESET_DATA_PUT_API, model)
  }
}