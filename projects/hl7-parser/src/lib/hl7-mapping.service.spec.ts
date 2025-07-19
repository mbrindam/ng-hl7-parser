import { TestBed } from '@angular/core/testing';
import { Hl7MappingService } from './hl7-mapping.service';
import { Hl7ParserService } from './hl7-parser.service';

describe('Hl7MappingService', () => {
  let mappingService: Hl7MappingService;
  let parserService: Hl7ParserService;
  const sampleMessage = `MSH|^~\u0026|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|202507191200||ORU^R01|MSG00002|P|2.3
PID|1||PATID1234||DOE^JOHN^A||19710101|M
PV1|1|I|WARDS^123^456
ORC|RE|ORDER123|FILL456
OBR|1|||GLUCOSE^Glucose
OBX|1|NM|||105|mg/dL`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Hl7MappingService, Hl7ParserService]
    });
    mappingService = TestBed.inject(Hl7MappingService);
    parserService = TestBed.inject(Hl7ParserService);
  });

  it('should be created', () => {
    expect(mappingService).toBeTruthy();
  });

  it('should map the MSH segment correctly', () => {
    const parsed = parserService.parse(sampleMessage);
    const mapped = mappingService.map(parsed);
    const header = mapped.find(obj => obj.name === 'Message Header');
    expect(header).toBeDefined();
    expect(header.data['Sending App']).toBe('SENDING_APP');
    expect(header.data['Message Type']).toBe('ORU^R01');
  });

  it('should map the PID segment correctly', () => {
    const parsed = parserService.parse(sampleMessage);
    const mapped = mappingService.map(parsed);
    const patient = mapped.find(obj => obj.name === 'Patient Information');
    expect(patient).toBeDefined();
    expect(patient.data['Patient ID']).toBe('PATID1234');
    expect(patient.data['Patient Name']).toBe('DOE^JOHN^A');
  });

  it('should map the PV1 segment correctly', () => {
    const parsed = parserService.parse(sampleMessage);
    const mapped = mappingService.map(parsed);
    const visit = mapped.find(obj => obj.name === 'Patient Visit');
    expect(visit).toBeDefined();
    expect(visit.data['Assigned Location']).toBe('WARDS^123^456');
  });

  it('should map ORC, OBR, and OBX segments correctly', () => {
    const parsed = parserService.parse(sampleMessage);
    const mapped = mappingService.map(parsed);
    
    const orc = mapped.find(obj => obj.name === 'Order Common Information');
    expect(orc).toBeDefined();
    expect(orc.data['Placer Order Number']).toBe('ORDER123');

    const obr = mapped.find(obj => obj.name === 'Order Observation Request');
    expect(obr).toBeDefined();
    expect(obr.data['Universal Service ID']).toBe('GLUCOSE^Glucose');

    const obx = mapped.find(obj => obj.name.startsWith('Observation:'));
    expect(obx).toBeDefined();
    expect(obx.data['Value']).toBe('105');
    expect(obx.data['Units']).toBe('mg/dL');
  });
});