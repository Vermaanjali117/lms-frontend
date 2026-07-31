import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';
export const routes: Routes = [
    // Default
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },

    // Auth routes
    {
        path: 'auth/login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login.component')
            .then(m => m.LoginComponent)
    },
    {
        path: 'auth/register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register.component')
            .then(m => m.RegisterComponent)
    },

    {
        path: 'student',
        canActivate: [authGuard],
        loadComponent: () => import('./shared/components/layout/layout.component')
            .then(m => m.LayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/student/dashboard/dashboard.component')
                    .then(m => m.DashboardComponent)
            },
            {
                path: 'courses',
                canActivate: [roleGuard(['student'])],
                loadComponent: () => import('./features/student/studentcourse/studentcourse.component')
                    .then(m => m.StudentcourseComponent)
            },
            {
                path: 'courses/:id',
                canActivate: [roleGuard(['student'])],
                loadComponent: () => import('./features/student/coursedetail/coursedetail.component')
                    .then(m => m.CoursedetailComponent)
            },
            {
                path: 'enrollments',
                canActivate: [roleGuard(['student'])],
                loadComponent: () => import('./features/student/enrollments/enrollments.component')
                    .then(m => m.EnrollmentsComponent)
            },
            {
                path: 'progress',
                canActivate: [roleGuard(['student'])],
                loadComponent: () => import('./features/student/progress/progress.component')
                    .then(m => m.ProgressComponent)
            },
            {
                path: 'learn/:id',
                canActivate: [roleGuard(['student'])],
                loadComponent: () => import('./features/student/learn/learn.component')
                    .then(m => m.LearnComponent)
            },

            {
                path: 'profile',
                loadComponent: () => import('../../src/app/features/profile/profile.component')
                    .then(m => m.ProfileComponent)
            },
            {
                path: 'reviews',
                loadComponent: () => import('../../src/app/features/student/reviews/reviews.component')
                    .then(m => m.ReviewsComponent)
            },
        ]
    },




    {
        path: 'instructor',
        canActivate: [authGuard],
        loadComponent: () => import('./shared/components/layout/layout.component')
            .then(m => m.LayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/instructor/instructordashboard/instructordashboard.component')
                    .then(m => m.InstructordashboardComponent)
            },
            {
                path: 'create-course',
                loadComponent: () => import('./features/instructor/create-course/create-course.component')
                    .then(m => m.CreateCourseComponent)
            },
            {
                path: 'courses/:id/edit',
                canActivate: [roleGuard(['instructor'])],
                loadComponent: () => import('./features/instructor/edit-course/edit-course.component')
                    .then(m => m.EditCourseComponent)
            },
            {
                path: 'my-courses',
                canActivate: [roleGuard(['instructor'])],
                loadComponent: () => import('./features/instructor/my-courses/my-courses.component')
                    .then(m => m.MyCoursesComponent)
            },
            {
                path: 'earnings',
                canActivate: [roleGuard(['instructor'])],
                loadComponent: () => import('./features/instructor/earnings/earnings.component')
                    .then(m => m.EarningsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('../../src/app/features/profile/profile.component')
                    .then(m => m.ProfileComponent)
            },

        ]
    },
    {
        path: 'admin',
        canActivate: [authGuard],
        loadComponent: () => import('./shared/components/layout/layout.component')
            .then(m => m.LayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component')
                    .then(m => m.AdminDashboardComponent)
            },
            {
                path: 'courses',
                loadComponent: () => import('./features/admin/pending-courses/pending-courses.component')
                    .then(m => m.PendingCoursesComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/admin/users/users.component')
                    .then(m => m.UsersComponent)
            },
            {
                path: 'categories',
                loadComponent: () => import('./features/admin/catagories/catagories.component')
                    .then(m => m.CatagoriesComponent)
            },
            {
                path: 'payments',
                loadComponent: () => import('./features/admin/payments/payments.component')
                    .then(m => m.PaymentsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('../../src/app/features/profile/profile.component')
                    .then(m => m.ProfileComponent)
            },
        ]
    },


    // Unauthorized
    {
        path: 'unauthorized',
        loadComponent: () => import('./shared/components/unauthorized/unauthorized.component')
            .then(m => m.UnauthorizedComponent)
    },

    // 404
    {
        path: '**',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
            .then(m => m.NotFoundComponent)
    }
];
