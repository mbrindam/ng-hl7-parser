import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Hl7ParserComponent, Hl7DescriptionComponent, Hl7TreeComponent, Hl7ParserService, SelectionService } from 'hl7-parser';
import { Hl7Message } from 'hl7-parser';
import { MessageStorageService } from './message-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, Hl7ParserComponent, Hl7DescriptionComponent, Hl7TreeComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageStorageService, Hl7ParserService]
})
export class AppComponent implements OnInit {
  title = 'sample-app';
  hl7Message = `MSH|^~\u0026|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|20250717060900||ADT^A01|MSG00001|P|2.3|||||||LRI_Common_Component^HL7^2.16.840.1.113883.9.16^ISO~LRI_GU_Component^HL7^2.16.840.1.113883.9.12^ISO
EVN|A01|20250717060900
PID|1||PATID1234^5^M11^A^MR^HOSP~123456789^6^M10^B^SSN^SS||DOE^JOHN^A^JR||19710101|M||C|123 MAIN ST^^ANYTOWN^CA^91234^USA^H~456 OAK AVE^^OTHERTOWN^CA^91235^USA^O||(800)555-1212|||S||PATID12345^2^M10^A^MR^HOSP|123456789|9876543210
PV1|1|I|2000^2012^01||||002345^6^7^8|||9^10^11|||||||||2000^2012^01|||||||||||||||||||||||||20250717060900`;

  parsedMessage: Hl7Message | null = null;
  parsingErrors: string[] = [];
  
  isEditing = false;
  editableMessage = '';
  savedMessages: { name: string, content: string }[] = [];

  constructor(
    private messageStorage: MessageStorageService,
    private parser: Hl7ParserService,
    private selectionService: SelectionService
  ) {}

  ngOnInit(): void {
    this.loadSavedMessages();
    if (this.savedMessages.length === 0) {
      this.saveMessage('Default ADT Message');
      this.addSampleOruMessage();
    }
    this.parseMessage();
  }

  addSampleOruMessage() {
    const oruMessage = `MSH|^~\u0026|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|202507191200||ORU^R01|MSG00002|P|2.3
PID|1||PATID1234^5^M11^A^MR^HOSP||DOE^JOHN^A^JR||19710101|M
ORC|RE|ORDER123|FILL456|||||||202507191200
OBR|1|ORDER123|FILL456|GLUCOSE^Glucose^LN|||202507191205
OBX|1|NM|GLUCOSE^Glucose^LN||105|mg/dL|70-110|N|||F`;
    this.messageStorage.saveMessage('Sample ORU Message', oruMessage);
    this.loadSavedMessages();
  }

  parseMessage() {
    const result = this.parser.parse(this.hl7Message);
    this.parsedMessage = result;
    this.parsingErrors = result.errors;
    this.selectionService.updateSelection(null);
  }

  loadSavedMessages(): void {
    this.savedMessages = this.messageStorage.getSavedMessages();
  }

  showEditor() {
    this.editableMessage = this.hl7Message;
    this.isEditing = true;
  }

  updateMessage() {
    this.hl7Message = this.editableMessage;
    this.isEditing = false;
    this.saveMessage();
    this.parseMessage();
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveMessage(defaultName?: string) {
    const name = defaultName || prompt('Enter a name for this message:', `Message ${this.savedMessages.length + 1}`);
    if (name) {
      this.messageStorage.saveMessage(name, this.hl7Message);
      this.loadSavedMessages();
    }
  }

  loadMessage(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.hl7Message = target.value;
      this.parseMessage();
    }
  }
}
