import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './core/interceptors/auth.intercepter';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import providetastToastr, { provideToastr } from 'ngx-toastr';
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
  provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  // provideAnimations(), // ← required for toastr
  provideToastr({
    timeOut: 3000,
    positionClass: 'toast-top-right',
    preventDuplicates: true,
    progressBar: true
  })

  ]
};
