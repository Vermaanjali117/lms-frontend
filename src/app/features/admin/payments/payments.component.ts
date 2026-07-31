import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, DatePipe],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {
  private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    payments = signal<any[]>([]);
    isLoading = signal(true);
    totalRevenue = signal(0);

    ngOnInit() {
        this.loadPayments();
    }

    loadPayments() {
        this.http.get<any>(`${this.apiUrl}/payments/all`)
            .subscribe({
                next: (res) => {
                    this.payments.set(res.data || []);
                    this.totalRevenue.set(res.totalRevenue || 0);
                    this.isLoading.set(false);
                },
                error: () => this.isLoading.set(false)
            });
    }
}
