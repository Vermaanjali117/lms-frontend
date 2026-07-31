import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  isLoading = signal(true);

  // Stats
  totalUsers = signal(0);
  totalStudents = signal(0);
  totalInstructors = signal(0);
  totalCourses = signal(0);
  pendingCourses = signal(0);
  totalRevenue = signal(0);

  // Data
  pendingCoursesList = signal<any[]>([]);
  recentUsers = signal<any[]>([]);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    forkJoin({
      users: this.http.get<any>(`${this.apiUrl}/admin/users`),
      pending: this.http.get<any>(`${this.apiUrl}/admin/courses/pending`),
      payments: this.http.get<any>(`${this.apiUrl}/payments/all`)
    }).subscribe({
      next: (results) => {
        // Users stats
        const users = results.users.data || [];
        this.totalUsers.set(users.length);
        this.totalStudents.set(
          users.filter((u: any) => u.role === 'student').length
        );
        this.totalInstructors.set(
          users.filter((u: any) => u.role === 'instructor').length
        );
        this.recentUsers.set(users.slice(0, 5));

        // Pending courses
        const pending = results.pending.data || [];
        this.pendingCourses.set(pending.length);
        this.pendingCoursesList.set(pending.slice(0, 5));

        // Revenue
        this.totalRevenue.set(results.payments.totalRevenue || 0);

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  approveCourse(courseId: string) {
    this.http.put<any>(`${this.apiUrl}/admin/courses/${courseId}/approve`, {})
      .subscribe({
        next: () => {
          alert('Course approved! ✅');
          this.loadDashboard();
        },
        error: (err) => alert(err.error?.message)
      });
  }

  rejectCourse(courseId: string) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    this.http.put<any>(`${this.apiUrl}/admin/courses/${courseId}/reject`, { reason })
      .subscribe({
        next: () => {
          alert('Course rejected!');
          this.loadDashboard();
        },
        error: (err) => alert(err.error?.message)
      });
  }
}
