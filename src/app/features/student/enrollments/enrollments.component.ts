import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-enrollments',
  imports: [CommonModule, RouterLink],
  templateUrl: './enrollments.component.html',
  styleUrl: './enrollments.component.css'
})
export class EnrollmentsComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  enrollments = signal<any[]>([]);
  isLoading = signal(true);
  filter = signal<'all' | 'completed' | 'inprogress'>('all');

  ngOnInit() {
    this.loadEnrollments();
  }

  loadEnrollments() {
    this.http.get<any>(`${this.apiUrl}/enrollments/my-enrollments`)
      .subscribe({
        next: (response) => {
          this.enrollments.set(response.data || []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  setFilter(filter: 'all' | 'completed' | 'inprogress') {
    this.filter.set(filter);
  }

  filteredEnrollments() {
    const all = this.enrollments();
    switch (this.filter()) {
      case 'completed':
        return all.filter(e => e.isCompleted);
      case 'inprogress':
        return all.filter(e => !e.isCompleted);
      default:
        return all;
    }
  }
}
