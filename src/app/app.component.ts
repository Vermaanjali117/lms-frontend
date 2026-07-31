import { Component, inject } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'lms-frontend';
    private authService = inject(AuthService);
  ngOnInit() {
    
    // Load user on app start
    const token = this.authService.getToken();
    if (token) {
      this.authService.getMe().subscribe();
    }
  }
}
