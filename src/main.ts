import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router'; // <-- Importes importantes
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone'; // <-- OBRIGATÓRIO
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { searchOutline, statsChartOutline } from 'ionicons/icons';


if (environment.production) {
  enableProdMode();
}

addIcons({ searchOutline, statsChartOutline });

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    provideIonicAngular(),

    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(HttpClientModule),
  ],
  
});
