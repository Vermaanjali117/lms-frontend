import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-create-course',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './create-course.component.html',
    styleUrl: './create-course.component.css'
})
export class CreateCourseComponent {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = environment.apiUrl;
    isGenerating = signal(false);
    categories = signal<any[]>([]);
    isLoading = signal(false);
    errorMessage = signal('');

    courseForm: FormGroup = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(5)]],
        description: ['', [Validators.required, Validators.minLength(20)]],
        price: [0, [Validators.required, Validators.min(0)]],
        category: ['', Validators.required],
    });

    get title() { return this.courseForm.get('title'); }
    get description() { return this.courseForm.get('description'); }
    get price() { return this.courseForm.get('price'); }
    get category() { return this.courseForm.get('category'); }

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.http.get<any>(`${this.apiUrl}/categories`).subscribe({
            next: (res) => this.categories.set(res.data || [])
        });
    }
    generateDescription() {
        const title = this.courseForm.get('title')?.value;
        const categoryId = this.courseForm.get('category')?.value;
        const category = this.categories().find(c => c._id === categoryId);

        if (!title || !category) {
            alert('Please enter title and select category first!');
            return;
        }

        this.isGenerating.set(true);

        this.http.post<any>(`${this.apiUrl}/ai/generate-description`, {
            title,
            category: category.name
        }).subscribe({
            next: (res) => {
                this.courseForm.patchValue({ description: res.data });
                this.isGenerating.set(false);
            },
            error: () => {
                this.isGenerating.set(false);
                alert('Failed to generate description!');
            }
        });
    }
    onSubmit() {
        if (this.courseForm.invalid) {
            this.courseForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');

        this.http.post<any>(`${this.apiUrl}/courses`, this.courseForm.value)
            .subscribe({
                next: (response) => {
                    this.isLoading.set(false);
                    // redirect to edit page to add sections/lessons
                    this.router.navigate(['/instructor/courses', response.data._id, 'edit']);
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(err.error?.message || 'Failed to create course!');
                }
            });
    }
}
