import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center gap-3 py-12">
      <div class="w-8 h-8 rounded-full border-2 border-slate-700 border-t-aprobada animate-spin"></div>
      <span class="text-slate-400 text-sm">Cargando pensum…</span>
    </div>
  `
})
export class SpinnerComponent {}
