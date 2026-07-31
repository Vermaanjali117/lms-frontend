import { Component, inject, OnInit, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-reviews',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private apiUrl = environment.apiUrl;

  courseId = input.required<string>();
  isEnrolled = input<boolean>(false); // ← add this

  reviews = signal<any[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  showForm = signal(false);
  selectedRating = signal(0);
  hoveredRating = signal(0);

  reviewForm: FormGroup = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1)]],
    review: ['', [Validators.required, Validators.minLength(10)]]
  });

  get review() { return this.reviewForm.get('review'); }

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.http.get<any>(`${this.apiUrl}/reviews/${this.courseId()}`)
      .subscribe({
        next: (res) => {
          this.reviews.set(res.data || []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  setRating(rating: number) {
    this.selectedRating.set(rating);
    this.reviewForm.patchValue({ rating });
  }

  submitReview() {
    if (this.reviewForm.invalid || this.selectedRating() === 0) return;

    this.isSubmitting.set(true);
    this.http.post<any>(
      `${this.apiUrl}/reviews/${this.courseId()}`,
      this.reviewForm.value
    ).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showForm.set(false);
        this.reviewForm.reset();
        this.selectedRating.set(0);
        this.loadReviews();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err.error?.message || 'Failed to submit review!');
      }
    });
  }

  averageRating(): number {
    if (this.reviews().length === 0) return 0;
    const sum = this.reviews().reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.reviews().length) * 10) / 10;
  }
}
