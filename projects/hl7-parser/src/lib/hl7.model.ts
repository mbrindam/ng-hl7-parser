export interface Hl7Message {
  segments: Hl7Segment[];
  errors: string[];
}

export interface Hl7Segment {
  name: string;
  fields: Hl7Field[];
  original: string;
}

export interface Hl7Field {
  repetitions: Hl7Repetition[];
  original: string;
}

export interface Hl7Repetition {
  components: Hl7Component[];
  original: string;
}

export interface Hl7Component {
  subComponents: Hl7SubComponent[];
  original: string;
}

export interface Hl7SubComponent {
  original: string;
}