import { environment } from "src/environments/environment";


export class APIConfig {


    // public static BASEURL: string = window.location.origin;
    public static BASEURL: string = (/^.*localhost.*/.test(window.location.host) && window.location.port == "4200") ? "https://localhost:44366" : environment.baseUrl;

    public static PORTFOLIO_HISTORY_GET_API: string = APIConfig.BASEURL + "/api/ParGIRHistory/getdata";
    public static PORTFOLIO_HISTORY_PUT_API: string = APIConfig.BASEURL + "/api/AssetGIR/put";
    public static PORTFOLIO_HISTORY_BULK_PUT_API: string = APIConfig.BASEURL + "/api/AssetGIR/putbulk";
    public static PORTFOLIO_HISTORY_DELETE_API: string = APIConfig.BASEURL + "/api/AssetGIR/delete";

    public static SAVE_LAYOUT_API: string = APIConfig.BASEURL + "/api/Layout/save";
    public static GET_LAYOUT_API: string = APIConfig.BASEURL + "/api/layout/get";
    public static DELETE_LAYOUT_API: string = APIConfig.BASEURL + "/api/layout/delete";

    public static CASH_BALANCE_GET_API: string = APIConfig.BASEURL + "/api/CashBalance/GetData";

    public static CAPITAL_ACTIVITY_PUT_API: string = APIConfig.BASEURL + "/api/CapitalActivity/put";
    public static CAPITAL_INVESTMENT_GET_API: string = APIConfig.BASEURL + "/api/CapitalActivity/getPositionCash";
    public static CAPITAL_ACTIVITY_GET_API: string = APIConfig.BASEURL + "/api/CapitalActivity/get";
    public static CAPITAL_ACTIVITY_GET_REF_API: string = APIConfig.BASEURL + "/api/CapitalActivity/getCapitalRef";
    public static CAPITAL_ACTIVITY_LOOKUP_API: string = APIConfig.BASEURL + "/api/CapitalActivity/lookUpCapitalActivity";
    public static CAPITAL_INVESTMENT_ASSOCIATE_API: string = APIConfig.BASEURL + "/api/CapitalActivity/associateInvestment";

    public static CAPITAL_ACTIVITY_BULK_PUT_API: string = APIConfig.BASEURL + "/api/CapitalActivity/bulkput";
}