import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent  implements OnInit {
 private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    users = signal<any[]>([]);
    isLoading = signal(true);
    filter = signal<string>('all');

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.http.get<any>(`${this.apiUrl}/admin/users`)
            .subscribe({
                next: (res) => {
                    this.users.set(res.data || []);
                    this.isLoading.set(false);
                },
                error: () => this.isLoading.set(false)
            });
    }

    filteredUsers() {
        if (this.filter() === 'all') return this.users();
        return this.users().filter(u => u.role === this.filter());
    }

    blockUnblock(userId: string) {
        this.http.put<any>(`${this.apiUrl}/admin/users/${userId}/block`, {})
            .subscribe({
                next: (res) => {
                    this.users.update(users =>
                        users.map(u => u._id === userId
                            ? { ...u, isBlocked: !u.isBlocked }
                            : u
                        )
                    );
                },
                error: (err) => alert(err.error?.message)
            });
    }
}
