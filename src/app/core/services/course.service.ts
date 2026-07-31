import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor() { }
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Get all published courses with filters
  getAllCourses(filters?: any): Observable<any> {
    let params = new HttpParams();

    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters?.maxPrice) params = params.set('maxPrice', filters.maxPrice);
    if (filters?.page) params = params.set('page', filters.page);
    if (filters?.limit) params = params.set('limit', filters.limit);
    if (filters?.sortBy) params = params.set('sortBy', filters.sortBy);

    return this.http.get<any>(`${this.apiUrl}/courses`, { params });
  }

  // Get single course
  getCourse(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/courses/${id}`);
  }

  // Get all categories
  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories`);
  }

  // Enroll in free course
  enrollFree(courseId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enrollments/enroll/${courseId}`, {});
  }

  // Check enrollment
  checkEnrollment(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/enrollments/check/${courseId}`);
  }

  // Create payment order
  createOrder(courseId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payments/create-order/${courseId}`, {});
  }

  // Verify payment
  verifyPayment(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payments/verify`, data);
  }

}
