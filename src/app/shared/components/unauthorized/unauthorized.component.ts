import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
@Component({
  selector: 'app-unauthorized',
  imports: [],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {
 private router = inject(Router);

    goBack() {
        this.router.navigate(['/']);
    }
}
