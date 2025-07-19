# Angular HL7 Parser

An Angular library for parsing, viewing, and interacting with HL7 (Health Level Seven) messages. This library provides components for displaying HL7 messages in a structured, easy-to-read format, including a raw parser view, a hierarchical tree view, and a detailed description view.

## Features

*   **HL7 Message Parsing:** Parses raw HL7 v2.x messages into a structured TypeScript object.
*   **Interactive Parser View:** Displays the raw message with color-coded segments, fields, components, and sub-components.
*   **Hierarchical Tree View:** Shows the message structure in an expandable tree.
*   **Bi-directional Selection:** Clicking an element in the parser view selects it in the tree, and vice-versa.
*   **Detailed Descriptions:** Displays definitions for selected segments and fields based on the HL7 standard.
*   **Customizable:** The library is built with Angular and can be easily integrated into any Angular application.

## Installation

To install the library, run the following command:

```bash
npm install ng-hl7-parser
```

## Usage

1.  **Import the components:** In your Angular module, import the necessary components from the library.

    ```typescript
    import { Hl7ParserComponent, Hl7TreeComponent, Hl7DescriptionComponent } from 'ng-hl7-parser';

    @NgModule({
      declarations: [
        // ... your components
      ],
      imports: [
        // ... your modules
        Hl7ParserComponent,
        Hl7TreeComponent,
        Hl7DescriptionComponent
      ],
      // ...
    })
    export class YourModule { }
    ```

2.  **Use the components in your template:**

    ```html
    <div class="container">
      <lib-hl7-parser [messageStr]="yourHl7MessageString"></lib-hl7-parser>
      <lib-hl7-tree [message]="parsedMessageObject"></lib-hl7-tree>
      <lib-hl7-description [message]="parsedMessageObject"></lib-hl7-description>
    </div>
    ```

    You will need to parse the raw HL7 message string into a `Hl7Message` object to pass to the tree and description components. You can use the `Hl7ParserService` for this.

## Development

This library was generated with [Angular CLI](https://github.com/angular/angular-cli).

### Build

Run `ng build hl7-parser` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test hl7-parser` to execute the unit tests.
