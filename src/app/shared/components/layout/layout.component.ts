import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from '../chatbot/chatbot.component';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ChatbotComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);

  isSidebarOpen = signal(true);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  logout() {
    this.authService.logout().subscribe();
  }

  get menuItems() {
    const role = this.authService.userRole();

    if (role === 'admin') {
      return [
        { label: 'Dashboard', icon: '📊', route: '/admin/dashboard' },
        { label: 'Pending Courses', icon: '📋', route: '/admin/courses' },
        { label: 'Users', icon: '👥', route: '/admin/users' },
        { label: 'Categories', icon: '🏷️', route: '/admin/categories' },
        { label: 'Payments', icon: '💳', route: '/admin/payments' },
        { label: 'profile', icon: '💳', route: '/admin/profile' },
      ];
    }
    if (role === 'instructor') {
      return [
        { label: 'Dashboard', icon: '📊', route: '/instructor/dashboard' },
        { label: 'My Courses', icon: '📚', route: '/instructor/my-courses' },
        { label: 'Create Course', icon: '➕', route: '/instructor/create-course' },
        { label: 'Earnings', icon: '💰', route: '/instructor/earnings' },
        { label: 'profile', icon: '💳', route: '/instructor/profile' },
      ];
    }

    // student
    return [
      { label: 'Dashboard', icon: '📊', route: '/student/dashboard' },
      { label: 'Browse Courses', icon: '🔍', route: '/student/courses' },
      { label: 'My Enrollments', icon: '📚', route: '/student/enrollments' },
      { label: 'Progress', icon: '📈', route: '/student/progress' },
      { label: 'profile', icon: '💳', route: '/student/profile' },
    ];
  }
}
