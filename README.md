# HL7 Viewer Angular Component

This project contains a reusable Angular component for displaying and interacting with HL7 messages, along with a sample application demonstrating its use.

## Features

*   **HL7 Message Parsing:** Dynamically parses HL7 messages into segments, fields, repetitions, and components.
*   **Interactive Highlighting & Tree View:** Allows users to click on any part of the message in either the raw text view or the tree view. The selection is synchronized between both views.
*   **Detailed Descriptions:** Displays contextual information about the selected part of the message, using a built-in HL7 dictionary.
*   **Data Formatting:** Automatically formats common data types like dates, timestamps, and phone numbers for improved readability.
*   **Dynamic Message Loading:** The sample application includes functionality to load new HL7 messages from a text area or from previously saved examples in local storage.

## Using the Library from NPM

This library is published on NPM as `ng-hl7-parser`. To use it in your own Angular project:

1.  **Install the library:**
    ```bash
    npm install ng-hl7-parser
    ```
2.  **Import and use the components:** Follow the usage instructions in the library's README file: [projects/hl7-parser/README.md](projects/hl7-parser/README.md)

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (which includes npm)
*   [Angular CLI](https://angular.dev/cli)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd hl7component
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

## Running the Sample Application

The sample application provides a demonstration of the `hl7-parser` component in action.

1.  Serve the application:
    ```bash
    ng serve sample-app --port 4201
    ```
2.  Open your browser to `http://localhost:4201/`.

You will see the HL7 viewer with a default message. You can click on different parts of the message to see the highlighting and description panel update. You can also use the controls at the top to load new messages.

## Building the Library

The `hl7-parser` library can be built separately to be published or used in other projects.

1.  Run the build command:
    ```bash
    ng build hl7-parser
    ```
2.  The compiled library will be located in the `dist/hl7-parser` directory.

## Extending the HL7 Dictionary

The component uses a static data file generated from the `hl7-dictionary` library. You can easily extend or override these definitions with your own custom data.

1.  **Edit the Custom Definitions:** Open the `projects/hl7-parser/src/lib/custom-definitions.json` file.
2.  **Add Your Definitions:** Follow the existing JSON structure to add or override definitions for specific HL7 versions, segments, and fields, including their component-level descriptions. For example, to override the description for PID-5 in version 2.3:
    ```json
    {
      "2.3": {
        "segments": {
          "PID": {
            "fields": {
              "5": {
                "desc": "Custom Patient Name",
                "comp": [
                  { "desc": "Custom Family Name" },
                  { "desc": "Custom Given Name" }
                ]
              }
            }
          }
        }
      }
    }
    ```
3.  **Re-generate the Dictionary:** After saving your changes, run the generation script from the root of the project:
    ```bash
    node generate-dictionary.js
    ```
4.  **Rebuild the Library:** Finally, rebuild the `hl7-parser` library to include your changes:
    ```bash
    ng build hl7-parser
    ```

Your custom definitions will now be part of the component.

## Using the HL7 Viewer Component in Another Project

To use the `hl7-parser` component in your own Angular application:

1.  **Build the library** as described above.
2.  **Copy the output:** Copy the `dist/hl7-parser` directory into your other project's root directory.
3.  **Configure `tsconfig.json`:** In your application's `tsconfig.json`, add a path mapping to the library in the `compilerOptions`:
    ```json
    {
      "compilerOptions": {
        "paths": {
          "hl7-parser": [
            "./dist/hl7-parser"
          ]
        }
      }
    }
    ```
4.  **Import and use the components:** In the component where you want to use the viewer, import `Hl7ParserComponent` and `Hl7DescriptionComponent` and add them to the `imports` array of your component decorator.

### Component API

The library exposes three main components: `Hl7ParserComponent`, `Hl7DescriptionComponent`, and `Hl7TreeComponent`.

#### `Hl7ParserComponent`

This is the main component that renders the interactive HL7 message.

**Inputs**

*   `@Input() messageStr: string`: The raw HL7 message string to be parsed and displayed.
*   `@Input() currentSelection: any`: The current selection object. This is used to synchronize the selection with other components, like the tree view.

**Outputs**

*   `@Output() selection = new EventEmitter<any>()`: Emits an event whenever a part of the HL7 message is clicked.

#### `Hl7DescriptionComponent`

This component displays the detailed description of the item selected in the `Hl7ParserComponent`.

**Inputs**

*   `@Input() selection: any`: The selection object emitted by the `Hl7ParserComponent`.
*   `@Input() message: any`: The parsed HL7 message object. This is used to determine the HL7 version for dictionary lookups.

#### `Hl7TreeComponent`

This component displays a hierarchical tree view of the parsed HL7 message.

**Inputs**

*   `@Input() message: any`: The parsed HL7 message object.
*   `@Input() currentSelection: any`: The current selection object.

**Outputs**

*   `@Output() selection = new EventEmitter<any>()`: Emits an event whenever a node in the tree is clicked.

### Services

#### `Hl7FormatService`

This service provides a `format()` method that can be used to format common HL7 data types.

### Example Usage

```typescript
import { Component } from '@angular/core';
import { Hl7ParserComponent, Hl7DescriptionComponent, Hl7TreeComponent, Hl7ParserService } from 'hl7-parser';
import { Hl7Message } from 'hl7-parser';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [Hl7ParserComponent, Hl7DescriptionComponent, Hl7TreeComponent],
  providers: [Hl7ParserService],
  template: `
    <h2>My HL7 Viewer</h2>
    <div class="main-content">
      <div class="parser-view">
        <lib-hl7-parser
          [messageStr]="yourHl7Message"
          [currentSelection]="currentSelection"
          (selection)="onSelection($event)">
        </lib-hl7-parser>
      </div>
      <div class="tree-view">
        <lib-hl7-tree [message]="parsedMessage" [currentSelection]="currentSelection" (selection)="onSelection($event)"></lib-hl7-tree>
      </div>
      <div class="description-view">
        <lib-hl7-description [selection]="currentSelection" [message]="parsedMessage"></lib-hl7-description>
      </div>
    </div>
  `
})
export class YourComponent {
  yourHl7Message = 'MSH|^~\\&|APP|FAC|APP|FAC|202501011200||ADT^A01|MSGID001|P|2.3';
  parsedMessage: Hl7Message | null = null;
  currentSelection: any;

  constructor(private parser: Hl7ParserService) {
    this.parsedMessage = this.parser.parse(this.yourHl7Message);
  }

  onSelection(selection: any) {
    this.currentSelection = { ...selection };
  }
}
```

## Running with Docker

You can also run the sample application using the pre-built Docker image available on Docker Hub.

### Using `docker run`

1.  **Pull the image:**
    ```bash
    docker pull mbrindam/ng-hl7-parser-app:latest
    ```
2.  **Run the container:**
    ```bash
    docker run -d -p 8080:80 --name hl7-parser-app mbrindam/ng-hl7-parser-app:latest
    ```
3.  Open your browser to `http://localhost:8080/`.

### Using `docker-compose`

1.  **Create a `docker-compose.yml` file:**
    ```yaml
    version: '3.8'
    services:
      hl7-parser-app:
        image: mbrindam/ng-hl7-parser-app:latest
        ports:
          - "8080:80"
        container_name: hl7-parser-app
    ```
2.  **Run the container:**
    ```bash
    docker-compose up -d
    ```
3.  Open your browser to `http://localhost:8080/`.