import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { LicenseManager } from "@ag-grid-enterprise/core";
import { CommonConfig } from './app/configs/common-config';
if (environment.production) {
  enableProdMode();
}

// Setting Ag-grid license key for the Ag-grid library wide
LicenseManager.setLicenseKey(CommonConfig.AG_GRID_LICENSE_KEY)

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
