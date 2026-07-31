import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewsComponent } from '../reviews/reviews.component';

declare var Razorpay: any;

@Component({
  selector: 'app-coursedetail',
  standalone: true,
  imports: [ReviewsComponent, CommonModule],
  templateUrl: './coursedetail.component.html',
  styleUrl: './coursedetail.component.css'
})
export class CoursedetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);

  course = signal<any>(null);
  isEnrolled = signal(false);
  isLoading = signal(true);
  isEnrolling = signal(false);
  expandedSections = signal<string[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourse(id);
    }
  }

  loadCourse(id: string) {
    this.courseService.getCourse(id).subscribe({
      next: (response) => {
        this.course.set(response.data);
        this.isLoading.set(false);
        this.checkEnrollment(id); // ← only called once here
      },
      error: () => this.isLoading.set(false)
    });
  }

  checkEnrollment(id: string) {
    this.courseService.checkEnrollment(id).subscribe({
      next: (response) => {
        console.log('Enrollment check:', response);
        this.isEnrolled.set(response.isEnrolled);
      }
    });
  }

  enrollFree() {
    this.isEnrolling.set(true);
    this.courseService.enrollFree(this.course()._id).subscribe({
      next: () => {
        this.isEnrolled.set(true);
        this.isEnrolling.set(false);
        alert('Enrolled successfully! 🎉');
      },
      error: (err) => {
        this.isEnrolling.set(false);
        alert(err.error?.message || 'Enrollment failed!');
      }
    });
  }

  payAndEnroll() {
    this.isEnrolling.set(true);
    this.courseService.createOrder(this.course()._id).subscribe({
      next: (response) => {
        this.isEnrolling.set(false);
        this.openRazorpay(response.data);
      },
      error: (err) => {
        this.isEnrolling.set(false);
        alert(err.error?.message || 'Payment failed!');
      }
    });
  }

  openRazorpay(orderData: any) {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'LMS Platform',
      description: orderData.courseName,
      order_id: orderData.orderId,
      handler: (response: any) => {
        this.verifyPayment(response);
      },
      prefill: {
        name: this.authService.currentUser()?.name,
        email: this.authService.currentUser()?.email,
      },
      theme: { color: '#4F46E5' }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  verifyPayment(response: any) {
    this.courseService.verifyPayment({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      courseId: this.course()._id
    }).subscribe({
      next: () => {
        this.isEnrolled.set(true);
        alert('Payment successful! You are now enrolled! 🎉');
      },
      error: () => {
        alert('Payment verification failed!');
      }
    });
  }

  toggleSection(sectionId: string) {
    this.expandedSections.update(sections => {
      if (sections.includes(sectionId)) {
        return sections.filter(s => s !== sectionId);
      }
      return [...sections, sectionId];
    });
  }

  isSectionExpanded(sectionId: string): boolean {
    return this.expandedSections().includes(sectionId);
  }

  getTotalLessons(): number {
    return this.course()?.sections?.reduce(
      (acc: number, section: any) => acc + section.lessons.length, 0
    ) || 0;
  }

  getTotalDuration(): number {
    return this.course()?.sections?.reduce(
      (acc: number, section: any) =>
        acc + section.lessons.reduce(
          (a: number, l: any) => a + l.duration, 0
        ), 0
    ) || 0;
  }

  goToLearn() {
    this.router.navigate(['/student/learn', this.course()._id]);
  }
}