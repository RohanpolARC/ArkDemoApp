import { environment } from "src/environments/environment.prod";


export class APIConfig {


    // public static BASEURL: string = window.location.origin;
    public static BASEURL: string = (/^.*localhost.*/.test(window.location.host) && window.location.port == "4200") ? "https://localhost:44366" : environment.baseUrl;

    public static PORTFOLIO_HISTORY_GET_API: string = APIConfig.BASEURL + "/api/ParGIRHistory/getdata";
    public static PORTFOLIO_HISTORY_PUT_API: string = APIConfig.BASEURL + "/api/AssetGIR/put";

    public static PORTFOLIO_HISTORY_BULK_PUT_API: string = APIConfig.BASEURL + "/api/AssetGIR/putbulk";

    public static PORTFOLIO_HISTORY_DELETE_API: string = APIConfig.BASEURL + "/api/AssetGIR/delete";
}