import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ICapitalActivityConfig } from "src/app/shared/models/CapitalActivityModel";

@Injectable()
export class ConfigurationService {

    /* Any change made to capital activity config data (eg. lock date) will be read / updated by using this behaviour subject. */
    public capitalActivityConfig = new BehaviorSubject<ICapitalActivityConfig>(null)
    capitalActivityConfig$ = this.capitalActivityConfig.asObservable();
    updateCapitalActivityConfig(config: ICapitalActivityConfig){
        this.config = config
        this.capitalActivityConfig.next(config)
    }

    config: ICapitalActivityConfig

    constructor(){}
    



}