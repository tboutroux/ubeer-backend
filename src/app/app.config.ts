import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideAuth0} from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAuth0({
      domain: 'dev-ugivb7mlochqqt8u.us.auth0.com',
      clientId: 'clTX09H6n3uqp9dMKaN8VhV97nF8m3Wt',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    }),
  ]
};
