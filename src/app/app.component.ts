import { ApplicationConfig, Component, importProvidersFrom } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, HttpClientModule],
})
export class AppComponent {
  constructor() {}
}
