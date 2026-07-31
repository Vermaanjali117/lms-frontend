import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-course',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.css'
})
export class EditCourseComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private apiUrl = environment.apiUrl;

  course = signal<any>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  courseId = '';

  showSectionForm = signal(false);
  showLessonForm = signal<string | null>(null);

  // Video upload signals
  isUploadingVideo = signal(false);
  uploadProgress = signal(0);
  uploadedVideoUrl = signal('');

  sectionForm: FormGroup = this.fb.group({
    title: ['', Validators.required]
  });

  lessonForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    type: ['video', Validators.required],
    content: ['', Validators.required],
    duration: [0],
    isPreview: [false]
  });

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    if (this.courseId) this.loadCourse();
  }

  loadCourse() {
    this.isLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/courses/my-course/${this.courseId}`)
      .subscribe({
        next: (res) => {
          this.course.set(res.data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  // Upload video to Cloudinary
  uploadVideo(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file!');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video size must be less than 100MB!');
      return;
    }

    this.isUploadingVideo.set(true);
    this.uploadProgress.set(0);

    const formData = new FormData();
    formData.append('video', file);

    this.http.post<any>(`${this.apiUrl}/upload/video`, formData)
      .subscribe({
        next: (res) => {
          this.uploadedVideoUrl.set(res.data.url);
          this.lessonForm.patchValue({ content: res.data.url });
          this.isUploadingVideo.set(false);
          this.uploadProgress.set(100);
        },
        error: (err) => {
          this.isUploadingVideo.set(false);
          alert(err.error?.message || 'Upload failed!');
        }
      });
  }

  addSection() {
    if (this.sectionForm.invalid) return;
    this.isSaving.set(true);

    this.http.post<any>(
      `${this.apiUrl}/courses/${this.courseId}/sections`,
      this.sectionForm.value
    ).subscribe({
      next: () => {
        this.sectionForm.reset();
        this.showSectionForm.set(false);
        this.isSaving.set(false);
        this.loadCourse();
      },
      error: () => this.isSaving.set(false)
    });
  }

  addLesson(sectionId: string) {
    if (this.lessonForm.invalid) return;
    this.isSaving.set(true);

    this.http.post<any>(
      `${this.apiUrl}/courses/${this.courseId}/sections/${sectionId}/lessons`,
      this.lessonForm.value
    ).subscribe({
      next: () => {
        this.lessonForm.reset({ type: 'video', duration: 0, isPreview: false });
        this.uploadedVideoUrl.set('');
        this.showLessonForm.set(null);
        this.isSaving.set(false);
        this.loadCourse();
      },
      error: () => this.isSaving.set(false)
    });
  }

  submitForReview() {
    if (!confirm('Submit this course for review?')) return;
    this.http.post<any>(
      `${this.apiUrl}/courses/${this.courseId}/submit`, {}
    ).subscribe({
      next: () => {
        alert('Course submitted for review! ✅');
        this.loadCourse();
      },
      error: (err) => alert(err.error?.message)
    });
  }

  toggleLessonForm(sectionId: string) {
    if (this.showLessonForm() === sectionId) {
      this.showLessonForm.set(null);
    } else {
      this.showLessonForm.set(sectionId);
      this.uploadedVideoUrl.set('');
      this.lessonForm.reset({ type: 'video', duration: 0, isPreview: false });
    }
  }

  onLessonTypeChange() {
    this.uploadedVideoUrl.set('');
    this.lessonForm.patchValue({ content: '' });
  }

  canSubmit(): boolean {
    const course = this.course();
    return course?.status === 'draft' || course?.status === 'rejected';
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

  getTotalLessons(): number {
    return this.course()?.sections?.reduce(
      (acc: number, s: any) => acc + s.lessons.length, 0
    ) || 0;
  }
}
