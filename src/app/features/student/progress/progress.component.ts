import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-progress',
    imports: [CommonModule, RouterLink],
    templateUrl: './progress.component.html',
    styleUrl: './progress.component.css'
})
export class ProgressComponent {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    enrollments = signal<any[]>([]);
    isLoading = signal(true);

    ngOnInit() {
        this.loadProgress();
    }

    loadProgress() {
        this.http.get<any>(`${this.apiUrl}/enrollments/my-enrollments`)
            .subscribe({
                next: (response) => {
                    this.enrollments.set(response.data || []);
                    this.isLoading.set(false);
                },
                error: () => this.isLoading.set(false)
            });
    }

    getProgressColor(progress: number): string {
        if (progress === 100) return 'bg-emerald-500';
        if (progress >= 50) return 'bg-indigo-500';
        if (progress >= 25) return 'bg-amber-500';
        return 'bg-red-400';
    }

    totalCompleted() {
        return this.enrollments().filter(e => e.isCompleted).length;
    }

    averageProgress() {
        if (this.enrollments().length === 0) return 0;
        const total = this.enrollments().reduce((acc, e) => acc + e.progress, 0);
        return Math.round(total / this.enrollments().length);
    }
}
