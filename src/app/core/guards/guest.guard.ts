import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();
    if (!token) {
        return true;
    }
    const role=authService.userRole();
    redirectToDashboard(role,router);
    return false;
};
function redirectToDashboard(role: string | undefined, router: Router) {
    switch (role) {
        case 'admin':
            router.navigate(['/admin/dashboard']);
            break;
        case 'instructor':
            router.navigate(['/instructor/dashboard']);
            break;
        default:
            router.navigate(['/student/dashboard']);
    }
}