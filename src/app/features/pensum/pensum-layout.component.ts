import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-pensum-layout',
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-slate-950">
      <app-navbar />
      <main>
        <router-outlet />
      </main>
    </div>
  `
})
export class PensumLayoutComponent {}
