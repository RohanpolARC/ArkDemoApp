import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { LicenseManager } from "@ag-grid-enterprise/core";
import { CommonConfig } from './app/configs/common-config';
import { ModuleRegistry } from '@ag-grid-community/core';
if (environment.production) {
  enableProdMode();
}


ModuleRegistry.registerModules(CommonConfig.AG_GRID_MODULES);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
