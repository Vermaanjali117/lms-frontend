import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protects routes that require login
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();

    if (token) {
        return true; // ✅ logged in → allow
    }
    console.log(" console.log(state.url) ===",state.url)
    // ❌ not logged in → redirect to login
    router.navigate(['/auth/login'], {

        queryParams: { returnUrl: state.url }
    });
    return false;
};