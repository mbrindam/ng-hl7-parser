import { Injectable } from '@angular/core';
import { hl7DictionaryData } from './hl7-dictionary.data';

@Injectable({
  providedIn: 'root'
})
export class Hl7DefinitionService {

  constructor() { }

  private getVersion(message: any): string {
    const version = message?.segments?.find((s: any) => s.name === 'MSH')?.fields[11]?.repetitions[0]?.components[0]?.original || '2.5.1';
    // The dictionary uses '2.5' instead of '2.5.1' for keys
    if (version === '2.5.1') {
      return '2.5';
    }
    return version;
  }

  getSegmentDescription(segmentName: string, message: any): string {
    const version = this.getVersion(message);
    const dictionary = (hl7DictionaryData as any)[version];
    if (dictionary && dictionary.segments[segmentName]) {
      return dictionary.segments[segmentName].desc || 'No description available.';
    }
    return 'No description available.';
  }

  getFieldDescription(segmentName: string, fieldIndex: number, message: any): any {
    const version = this.getVersion(message);
    const dictionary = (hl7DictionaryData as any)[version];
    const segmentDef = dictionary?.segments[segmentName];
    
    if (segmentDef && segmentDef.fields && segmentDef.fields[fieldIndex - 1]) {
      return segmentDef.fields[fieldIndex - 1];
    }
    return null;
  }
}