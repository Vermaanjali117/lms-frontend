import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-catagories',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catagories.component.html',
  styleUrl: './catagories.component.css'
})
export class CatagoriesComponent  implements OnInit {
  private http = inject(HttpClient);
    private fb = inject(FormBuilder);
    private apiUrl = environment.apiUrl;

    categories = signal<any[]>([]);
    isLoading = signal(true);
    isSaving = signal(false);
    showForm = signal(false);
    editingId = signal<string | null>(null);

    categoryForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        description: ['']
    });

    get name() { return this.categoryForm.get('name'); }

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.http.get<any>(`${this.apiUrl}/categories`)
            .subscribe({
                next: (res) => {
                    this.categories.set(res.data || []);
                    this.isLoading.set(false);
                },
                error: () => this.isLoading.set(false)
            });
    }

    openAddForm() {
        this.editingId.set(null);
        this.categoryForm.reset();
        this.showForm.set(true);
    }

    openEditForm(category: any) {
        this.editingId.set(category._id);
        this.categoryForm.patchValue({
            name: category.name,
            description: category.description
        });
        this.showForm.set(true);
    }

    saveCategory() {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        this.isSaving.set(true);

        const request = this.editingId()
            ? this.http.put<any>(`${this.apiUrl}/categories/${this.editingId()}`, this.categoryForm.value)
            : this.http.post<any>(`${this.apiUrl}/categories`, this.categoryForm.value);

        request.subscribe({
            next: () => {
                this.isSaving.set(false);
                this.showForm.set(false);
                this.categoryForm.reset();
                this.editingId.set(null);
                this.loadCategories();
            },
            error: (err) => {
                this.isSaving.set(false);
                alert(err.error?.message || 'Failed!');
            }
        });
    }

    deleteCategory(id: string) {
        if (!confirm('Are you sure you want to delete this category?')) return;

        this.http.delete<any>(`${this.apiUrl}/categories/${id}`)
            .subscribe({
                next: () => {
                    this.categories.update(cats =>
                        cats.filter(c => c._id !== id)
                    );
                },
                error: (err) => alert(err.error?.message)
            });
    }

    cancelForm() {
        this.showForm.set(false);
        this.categoryForm.reset();
        this.editingId.set(null);
    }
}
