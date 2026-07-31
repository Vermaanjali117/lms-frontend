import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-studentcourse',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './studentcourse.component.html',
  styleUrl: './studentcourse.component.css'
})
export class StudentcourseComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private destroy$ = new Subject<void>();

  courses = signal<any[]>([]);
  categories = signal<any[]>([]);
  isLoading = signal(true);
  totalPages = signal(0);
  currentPage = signal(1);
  total = signal(0);

  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  sortControl = new FormControl('createdAt');

  ngOnInit() {
    this.loadCategories();
    this.loadCourses();
    this.setupSearch();
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(search => {
        this.isLoading.set(true);
        return this.http.get<any>(`${this.apiUrl}/courses`, {
          params: new HttpParams()
            .set('search', search || '')
            .set('page', '1')
        });
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.courses.set(response.data || []);
        this.totalPages.set(response.pagination?.totalPages || 0);
        this.total.set(response.pagination?.total || 0);
        this.isLoading.set(false);
      }
    });
  }

  loadCategories() {
    this.http.get<any>(`${this.apiUrl}/categories`)
      .subscribe({
        next: (res) => this.categories.set(res.data || [])
      });
  }

  loadCourses() {
    this.isLoading.set(true);
    let params = new HttpParams()
      .set('page', this.currentPage().toString());

    if (this.categoryControl.value) {
      params = params.set('category', this.categoryControl.value);
    }
    if (this.sortControl.value) {
      params = params.set('sortBy', this.sortControl.value);
    }

    this.http.get<any>(`${this.apiUrl}/courses`, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.courses.set(response.data || []);
          this.totalPages.set(response.pagination?.totalPages || 0);
          this.total.set(response.pagination?.total || 0);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadCourses();
  }

  clearFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
    this.sortControl.setValue('createdAt');
    this.currentPage.set(1);
    this.loadCourses();
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.loadCourses();
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
