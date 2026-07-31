import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protects routes based on role
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const userRole = authService.userRole();

        if (userRole && allowedRoles.includes(userRole)) {
            return true; // ✅ correct role → allow
        }

        // ❌ wrong role → redirect
        router.navigate(['/unauthorized']);
        return false;
    };
};