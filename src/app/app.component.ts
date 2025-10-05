import { ApplicationConfig, Component, importProvidersFrom } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {}
}
