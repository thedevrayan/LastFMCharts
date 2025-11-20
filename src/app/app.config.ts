import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  add,
  addCircleOutline,
  musicalNotes,
  eyeOutline,
  pencilOutline,
  trash,
  arrowBackOutline,
  createOutline
} from 'ionicons/icons';

// Registrar ícones globalmente
addIcons({
  add,
  addCircleOutline,
  musicalNotes,
  eyeOutline,
  pencilOutline,
  trash,
  arrowBackOutline,
  createOutline
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({}),
    importProvidersFrom(HttpClientModule) // ✅ substitui Firebase por HttpClient
  ]
};
