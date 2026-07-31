import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pending-courses',
  imports: [],
  templateUrl: './pending-courses.component.html',
  styleUrl: './pending-courses.component.css'
})
export class PendingCoursesComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  courses = signal<any[]>([]);
  isLoading = signal(true);
  isActing = signal<string | null>(null);

  ngOnInit() {
    this.loadPendingCourses();
  }

  loadPendingCourses() {
    this.http.get<any>(`${this.apiUrl}/admin/courses/pending`)
      .subscribe({
        next: (res) => {
          this.courses.set(res.data || []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  approveCourse(courseId: string) {
    this.isActing.set(courseId);
    this.http.put<any>(`${this.apiUrl}/admin/courses/${courseId}/approve`, {})
      .subscribe({
        next: () => {
          this.isActing.set(null);
          this.courses.update(courses =>
            courses.filter(c => c._id !== courseId)
          );
        },
        error: (err) => {
          this.isActing.set(null);
          alert(err.error?.message);
        }
      });
  }

  rejectCourse(courseId: string) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    this.isActing.set(courseId);
    this.http.put<any>(`${this.apiUrl}/admin/courses/${courseId}/reject`, { reason })
      .subscribe({
        next: () => {
          this.isActing.set(null);
          this.courses.update(courses =>
            courses.filter(c => c._id !== courseId)
          );
        },
        error: (err) => {
          this.isActing.set(null);
          alert(err.error?.message);
        }
      });
  }
}
