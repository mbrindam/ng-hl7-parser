import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageStorageService {
  private readonly STORAGE_KEY = 'hl7_messages';

  constructor() { }

  getSavedMessages(): { name: string, content: string }[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  saveMessage(name: string, content: string): void {
    const messages = this.getSavedMessages();
    // Avoid saving duplicates
    if (!messages.some(m => m.name === name)) {
      messages.push({ name, content });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
    }
  }
}
