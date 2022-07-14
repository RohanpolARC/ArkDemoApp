import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APIConfig } from "src/app/configs/api-config";
import { UnfundedAsset } from "src/app/shared/models/UnfundedAssetModel";
import { MsalUserService } from "../Auth/msaluser.service";

@Injectable()
export class UnfundedAssetsService {

  // Injected in unfunded-assets.module.ts
  
  constructor(
    private http: HttpClient,
    private msalSvc: MsalUserService
  ) { }

  private getHttpOptions(){
    return {
      headers: new HttpHeaders({  
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.msalSvc.GetAccessToken()  
      })
    }
  }

  public getAssetFundingDetails(): Observable<any[]>{

    return this.http.get<any[]>(`${APIConfig.ASSET_FUNDING_DETAILS_GET_API}`, this.getHttpOptions());
  }

  public putUnfundedAsset(model: UnfundedAsset){

    return this.http.post(`${APIConfig.UNFUNDED_ASSET_PUT_API}`, model, this.getHttpOptions());
  }

  public getUnfundedAssets(assetID: number = null, fundingDate: string = null){
  
    return this.http.get(`${APIConfig.UNFUNDED_ASSET_GET_API}/?assetID=${assetID}&fundingDate=${fundingDate}`, this.getHttpOptions());
  }
}
