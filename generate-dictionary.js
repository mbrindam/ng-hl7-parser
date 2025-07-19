const fs = require('fs');
const path = require('path');
const HL7Dictionary = require('hl7-dictionary');
const customDefs = require('./projects/hl7-parser/src/lib/custom-definitions.json');

const versions = ['2.3', '2.4', '2.5', '2.5.1', '2.6', '2.7'];
const output = {};

console.log('Starting dictionary generation...');

for (const version of versions) {
  const definitionKey = version === '2.5.1' ? '2.5' : version; // Map 2.5.1 to 2.5 for dictionary lookup
  
  if (HL7Dictionary.definitions[definitionKey]) {
    // Create a deep copy to avoid modifying the original library data
    let baseVersionDef = JSON.parse(JSON.stringify(HL7Dictionary.definitions[definitionKey]));
    
    // Check for custom definitions for this version
    let customVersionDef = customDefs[definitionKey];
    if (customVersionDef && customVersionDef.segments) {
      console.log(`Applying custom definitions for version ${definitionKey}...`);
      for (const segName in customVersionDef.segments) {
        if (baseVersionDef.segments[segName] && customVersionDef.segments[segName].fields) {
          for (const fieldIndexStr in customVersionDef.segments[segName].fields) {
            const fieldIndex = parseInt(fieldIndexStr) - 1; // Convert to 0-based index
            if (fieldIndex >= 0) {
              // Create a deep copy of the custom field to avoid reference issues
              const customField = JSON.parse(JSON.stringify(customVersionDef.segments[segName].fields[fieldIndexStr]));
              
              // Overwrite or add the field definition
              if (!baseVersionDef.segments[segName].fields) {
                baseVersionDef.segments[segName].fields = [];
              }
              baseVersionDef.segments[segName].fields[fieldIndex] = customField;
              console.log(`  - Overlaid ${segName}-${fieldIndexStr}`);
            }
          }
        }
      }
    }
    output[version] = baseVersionDef;
  }
}

const outputPath = path.join(__dirname, 'projects/hl7-parser/src/lib/hl7-dictionary.data.ts');
fs.writeFileSync(outputPath, `export const hl7DictionaryData = ${JSON.stringify(output, null, 2)};`);
console.log('HL7 dictionary data generated successfully.');