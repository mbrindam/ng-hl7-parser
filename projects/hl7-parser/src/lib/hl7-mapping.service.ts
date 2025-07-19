import { Injectable } from '@angular/core';
import { Hl7Message, Hl7Field } from './hl7.model';
import { Hl7DefinitionService } from './hl7-definition.service';

@Injectable({
  providedIn: 'root'
})
export class Hl7MappingService {

  constructor(private definitionService: Hl7DefinitionService) { }

  private getComponentValue(field: Hl7Field | undefined, repetitionIndex: number, componentIndex: number): string {
    return field?.repetitions[repetitionIndex]?.components[componentIndex - 1]?.original || '';
  }

  private mapFieldWithComponents(field: Hl7Field | undefined, fieldDef: any): any {
    if (!field || !fieldDef || !fieldDef.comp) {
      return field?.original || '';
    }

    const repetitions = field.repetitions.map(repetition => {
      const componentMap: any = {};
      repetition.components.forEach((component, index) => {
        const compDef = fieldDef.comp[index];
        if (compDef && compDef.desc) {
          componentMap[compDef.desc] = component.original;
        }
      });
      return componentMap;
    });

    return repetitions.length === 1 ? repetitions[0] : repetitions;
  }

  map(message: Hl7Message): any[] {
    const mappedObjects: any[] = [];
    if (!message) return mappedObjects;

    const getValue = (segment: any, fieldIndex: number) => segment?.fields[fieldIndex]?.original || '';
    const getField = (segment: any, fieldIndex: number) => segment?.fields[fieldIndex];

    // Message Header
    const msh = message.segments.find(s => s.name === 'MSH');
    if (msh) {
      const messageTypeField = getField(msh, 9);
      const messageTypeDef = this.definitionService.getFieldDescription('MSH', 9, message);

      mappedObjects.push({
        name: 'Message Header',
        data: [
          { key: 'Sending App', value: getValue(msh, 3) },
          { key: 'Sending Facility', value: getValue(msh, 4) },
          { key: 'Receiving App', value: getValue(msh, 5) },
          { key: 'Receiving Facility', value: getValue(msh, 6) },
          { key: 'Message Date', value: getValue(msh, 7) },
          { key: 'Message Type', value: this.mapFieldWithComponents(messageTypeField, messageTypeDef) },
          { key: 'Control ID', value: getValue(msh, 10) },
          { key: 'Version', value: getValue(msh, 12) },
        ]
      });
    }

    // Patient Information
    const pid = message.segments.find(s => s.name === 'PID');
    if (pid) {
        const patientIdField = getField(pid, 3);
        const patientIdDef = this.definitionService.getFieldDescription('PID', 3, message);
        const patientNameField = getField(pid, 5);
        const patientNameDef = this.definitionService.getFieldDescription('PID', 5, message);
        const addressField = getField(pid, 11);
        const addressDef = this.definitionService.getFieldDescription('PID', 11, message);
        
        const familyName = this.getComponentValue(patientNameField, 0, 1);
        const givenName = this.getComponentValue(patientNameField, 0, 2);
        const middleInitial = this.getComponentValue(patientNameField, 0, 3) ? ` ${this.getComponentValue(patientNameField, 0, 3)}.` : '';
        const formattedName = `${familyName}, ${givenName}${middleInitial}`;
        
        const patientIds = patientIdField?.repetitions.map((rep: any) => rep.components[0]?.original).filter((id: string | undefined) => id) || [];

        mappedObjects.push({
            name: 'Patient Information',
            data: [
                { key: 'Formatted Name', value: formattedName },
                { key: 'Date of Birth', value: getValue(pid, 7) },
                { key: 'Sex', value: getValue(pid, 8) },
                { key: 'Phone Number', value: getValue(pid, 13) },
                { key: 'Patient IDs', value: patientIds.join(', ') },
                { key: 'Address', value: this.mapFieldWithComponents(addressField, addressDef) },
                { key: 'Patient Name', value: this.mapFieldWithComponents(patientNameField, patientNameDef) },
                { key: 'Patient Identifier List', value: this.mapFieldWithComponents(patientIdField, patientIdDef) },
            ]
        });
    }
    
    // Patient Visit, Orders, etc.
    const pv1 = message.segments.find(s => s.name === 'PV1');
    if (pv1) {
      const assignedLocationField = getField(pv1, 3);
      const assignedLocationDef = this.definitionService.getFieldDescription('PV1', 3, message);

      mappedObjects.push({
        name: 'Patient Visit',
        data: [
          { key: 'Patient Class', value: getValue(pv1, 2) },
          { key: 'Assigned Location', value: this.mapFieldWithComponents(assignedLocationField, assignedLocationDef) },
          { key: 'Admitting Doctor', value: getValue(pv1, 7) },
          { key: 'Visit Number', value: getValue(pv1, 19) },
          { key: 'Admit Date/Time', value: getValue(pv1, 44) },
        ]
      });
    }

    message.segments.forEach(segment => {
      if (segment.name === 'ORC') {
        mappedObjects.push({
          name: 'Order Common Information',
          data: [
            { key: 'Order Control', value: getValue(segment, 1) },
            { key: 'Placer Order Number', value: getValue(segment, 2) },
            { key: 'Filler Order Number', value: getValue(segment, 3) },
            { key: 'Transaction Date/Time', value: getValue(segment, 9) },
          ]
        });
      } else if (segment.name === 'OBR') {
        mappedObjects.push({
          name: 'Order Observation Request',
          data: [
            { key: 'Placer Order Number', value: getValue(segment, 2) },
            { key: 'Filler Order Number', value: getValue(segment, 3) },
            { key: 'Universal Service ID', value: getValue(segment, 4) },
            { key: 'Observation Date/Time', value: getValue(segment, 7) },
          ]
        });
      } else if (segment.name === 'OBX') {
        mappedObjects.push({
          name: `Observation: ${getValue(segment, 3)}`,
          data: [
            { key: 'Value Type', value: getValue(segment, 2) },
            { key: 'Observation Identifier', value: getValue(segment, 3) },
            { key: 'Value', value: getValue(segment, 5) },
            { key: 'Units', value: getValue(segment, 6) },
            { key: 'Reference Range', value: getValue(segment, 7) },
            { key: 'Abnormal Flags', value: getValue(segment, 8) },
          ]
        });
      }
    });

    return mappedObjects;
  }
}