import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-courses',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.css'
})
export class MyCoursesComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  courses = signal<any[]>([]);
  isLoading = signal(true);
  filter = signal<string>('all');

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.http.get<any>(`${this.apiUrl}/courses/instructor/my-courses`)
      .subscribe({
        next: (res) => {
          this.courses.set(res.data || []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  setFilter(filter: string) {
    this.filter.set(filter);
  }

  filteredCourses() {
    if (this.filter() === 'all') return this.courses();
    return this.courses().filter(c => c.status === this.filter());
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
