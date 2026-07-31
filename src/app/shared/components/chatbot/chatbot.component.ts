import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
// Define interface at top of file
interface Message {
  role: 'user' | 'ai';
  content: string;
}
@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  isOpen = signal(false);
  isTyping = signal(false);
  messages = signal<Message[]>([
    {
      role: 'ai',
      content: 'Hi! 👋 I am your AI learning assistant. How can I help you today?'
    }
  ]);
  userInput = '';

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput.trim();
    this.userInput = '';

    // Add user message
    this.messages.update(msgs => [...msgs, {
      role: 'user',
      content: userMessage
    }]);

    this.isTyping.set(true);

    // Call AI API
    this.http.post<any>(`${this.apiUrl}/ai/chat`, {
      message: userMessage
    }).subscribe({
      next: (res) => {
        this.isTyping.set(false);
        this.messages.update(msgs => [...msgs, {
          role: 'ai',
          content: res.data
        }]);
      },
      error: () => {
        this.isTyping.set(false);
        this.messages.update(msgs => [...msgs, {
          role: 'ai',
          content: 'Sorry, I am having trouble responding. Please try again!'
        }]);
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
