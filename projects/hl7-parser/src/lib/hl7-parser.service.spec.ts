import { TestBed } from '@angular/core/testing';
import { Hl7ParserService } from './hl7-parser.service';

describe('Hl7ParserService', () => {
  let service: Hl7ParserService;
  const sampleMessage = `MSH|^~\u0026|APP|FAC|||202501011200||ADT^A01|MSGID001|P|2.3
PID|1||12345^^^MRN^MR||DOE^JOHN^A||19700101|M|||123 MAIN ST^^ANYTOWN^CA^12345~456 OAK AVE^^ANYTOWN^CA^12345`;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Hl7ParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse the correct number of segments', () => {
    const parsed = service.parse(sampleMessage);
    expect(parsed.segments.length).toBe(2);
  });

  it('should correctly identify segment names', () => {
    const parsed = service.parse(sampleMessage);
    expect(parsed.segments[0].name).toBe('MSH');
    expect(parsed.segments[1].name).toBe('PID');
  });

  it('should parse the correct number of fields in a segment', () => {
    const parsed = service.parse(sampleMessage);
    // MSH has 12 fields in the sample
    expect(parsed.segments[0].fields.length).toBe(12);
    // PID has 12 fields in the sample
    expect(parsed.segments[1].fields.length).toBe(12);
  });

  it('should parse a simple field value', () => {
    const parsed = service.parse(sampleMessage);
    // MSH-3 Sending App
    expect(parsed.segments[0].fields[2].original).toBe('APP');
  });

  it('should parse a field with components', () => {
    const parsed = service.parse(sampleMessage);
    // MSH-9 Message Type
    const messageTypeField = parsed.segments[0].fields[8];
    expect(messageTypeField.repetitions.length).toBe(1);
    expect(messageTypeField.repetitions[0].components.length).toBe(2);
    expect(messageTypeField.repetitions[0].components[0].original).toBe('ADT');
    expect(messageTypeField.repetitions[0].components[1].original).toBe('A01');
  });

  it('should parse a field with repetitions', () => {
    const parsed = service.parse(sampleMessage);
    // PID-11 Patient Address
    const addressField = parsed.segments[1].fields[11];
    expect(addressField.repetitions.length).toBe(2);
    expect(addressField.repetitions[0].original).toBe('123 MAIN ST^^ANYTOWN^CA^12345');
    expect(addressField.repetitions[1].original).toBe('456 OAK AVE^^ANYTOWN^CA^12345');
  });
});