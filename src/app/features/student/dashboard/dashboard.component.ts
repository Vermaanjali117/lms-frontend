import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  aiRecommendations = signal<any[]>([]);
  isLoadingAI = signal(false);
  // Signals
  enrollments = signal<any[]>([]);
  recentCourses = signal<any[]>([]);
  isLoading = signal(true);

  // Stats
  totalEnrollments = signal(0);
  completedCourses = signal(0);
  inProgressCourses = signal(0);
  totalProgress = signal(0);

  ngOnInit() {
    this.loadDashboardData();
    this.loadAIRecommendations();
  }

  loadDashboardData() {
    // forkJoin - RxJS operator
    // Runs multiple API calls simultaneously
    // Waits for ALL to complete then returns results
    forkJoin({
      enrollments: this.http.get<any>(`${this.apiUrl}/enrollments/my-enrollments`),
      courses: this.http.get<any>(`${this.apiUrl}/courses?limit=6`)
    }).subscribe({
      next: (results) => {
        const enrollments = results.enrollments.data || [];
        this.enrollments.set(enrollments);
        this.recentCourses.set(results.courses.data || []);

        // Calculate stats
        this.totalEnrollments.set(enrollments.length);
        this.completedCourses.set(
          enrollments.filter((e: any) => e.isCompleted).length
        );
        this.inProgressCourses.set(
          enrollments.filter((e: any) => !e.isCompleted && e.progress > 0).length
        );

        // Average progress
        if (enrollments.length > 0) {
          const avg = enrollments.reduce((acc: number, e: any) => acc + e.progress, 0) / enrollments.length;
          this.totalProgress.set(Math.round(avg));
        }

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
  loadAIRecommendations() {
    this.isLoadingAI.set(true);
    this.http.get<any>(`${this.apiUrl}/ai/recommendations`)
      .subscribe({
        next: (res) => {
          this.aiRecommendations.set(res.data || []);
          this.isLoadingAI.set(false);
        },
        error: () => this.isLoadingAI.set(false)
      });
  }
}
