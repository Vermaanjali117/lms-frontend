import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-instructordashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './instructordashboard.component.html',
  styleUrl: './instructordashboard.component.css'
})
export class InstructordashboardComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  courses = signal<any[]>([]);
  isLoading = signal(true);
  totalCourses = signal(0);
  publishedCourses = signal(0);
  pendingCourses = signal(0);
  totalStudents = signal(0);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.http.get<any>(`${this.apiUrl}/courses/instructor/my-courses`)
      .subscribe({
        next: (response) => {
          const courses = response.data || [];
          this.courses.set(courses);
          this.totalCourses.set(courses.length);
          this.publishedCourses.set(
            courses.filter((c: any) => c.status === 'published').length
          );
          this.pendingCourses.set(
            courses.filter((c: any) => c.status === 'pending').length
          );
          this.totalStudents.set(
            courses.reduce((acc: number, c: any) => acc + c.totalStudents, 0)
          );
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
