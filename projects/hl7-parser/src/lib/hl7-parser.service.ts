import { Injectable } from '@angular/core';
import { Hl7Message, Hl7Segment, Hl7Field, Hl7Repetition, Hl7Component, Hl7SubComponent } from './hl7.model';

@Injectable({
  providedIn: 'root'
})
export class Hl7ParserService {

  constructor() { }

  public parse(message: string): Hl7Message {
    const errors: string[] = [];
    const segments: Hl7Segment[] = [];

    if (!message || !message.startsWith('MSH')) {
      errors.push('Invalid HL7 message: Must start with an MSH segment.');
      return { segments, errors };
    }

    const segmentLines = message.split('\n').filter(s => s);

    segmentLines.forEach(segmentStr => {
      const fields = segmentStr.split('|');
      const segmentName = fields[0];
      const segment: Hl7Segment = {
        name: segmentName,
        original: segmentStr,
        fields: fields.map(fieldStr => {
          const repetitions = fieldStr.split('~').map(repetitionStr => {
            const components = repetitionStr.split('^').map(componentStr => {
              const subComponents = componentStr.split('&').map(subComponentStr => ({ original: subComponentStr }));
              return { original: componentStr, subComponents };
            });
            return { original: repetitionStr, components };
          });
          return { original: fieldStr, repetitions };
        })
      };
      segments.push(segment);
    });

    return { segments, errors };
  }
}