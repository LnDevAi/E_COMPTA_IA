import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>🤖 Assistant IA</h1>
      <p>Module en cours d’intégration. Téléversement documents, OCR, génération d’écritures.</p>
    </div>
  `,
  styles: [`
    .module-container { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  `]
})
export class AiAssistantComponent {}