import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Hl7FormatService {

  constructor() { }

  format(value: string): string {
    if (!value) {
      return '';
    }

    // Phone Number
    if (/^\d{10}$/.test(value)) {
      return `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
    }
    
    // YYYYMMDDHHMMSS Timestamp
    if (/^\d{14}$/.test(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);
      const hour = value.substring(8, 10);
      const minute = value.substring(10, 12);
      const second = value.substring(12, 14);
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    // YYYYMMDD Date
    if (/^\d{8}$/.test(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);
      return `${year}-${month}-${day}`;
    }

    return value;
  }
}
