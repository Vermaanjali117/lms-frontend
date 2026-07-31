import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-earnings',
  imports: [DatePipe, CommonModule],
  templateUrl: './earnings.component.html',
  styleUrl: './earnings.component.css'
})
export class EarningsComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  payments = signal<any[]>([]);
  isLoading = signal(true);

  totalEarnings = signal(0);
  platformCommission = signal(0);
  netEarnings = signal(0);
  totalSales = signal(0);

  ngOnInit() {
    this.loadEarnings();
  }

  loadEarnings() {
    this.http.get<any>(`${this.apiUrl}/payments/instructor/earnings`)
      .subscribe({
        next: (res) => {
          const payments = res.data || [];
          this.payments.set(payments);
          this.totalSales.set(payments.length);

          const total = payments.reduce((acc: number, p: any) => acc + p.amount, 0);
          this.totalEarnings.set(total);
          this.platformCommission.set(Math.round(total * 0.30));
          this.netEarnings.set(Math.round(total * 0.70));

          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }
}
