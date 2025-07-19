import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hl7DefinitionService } from './hl7-definition.service';
import { Hl7FormatService } from './hl7-format.service';
import { Hl7MappingService } from './hl7-mapping.service';
import { Hl7Message } from './hl7.model';
import { SelectionService } from './selection.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-hl7-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hl7-description.component.html',
  styleUrls: ['./hl7-description.component.css'],
  providers: [Hl7FormatService, Hl7MappingService, Hl7DefinitionService]
})
export class Hl7DescriptionComponent implements OnChanges, OnInit, OnDestroy {
  @Input() message: Hl7Message | null = null;
  
  selection: any = null;
  activeTab: 'detail' | 'objects' = 'detail';
  segmentDescription: string = '';
  fieldDescription: any = null;
  mappedObjects: any[] = [];

  private selectionSubscription: Subscription | undefined;

  constructor(
    private definitionService: Hl7DefinitionService,
    public formatService: Hl7FormatService,
    private mappingService: Hl7MappingService,
    private selectionService: SelectionService
  ) { }

  ngOnInit(): void {
    this.selectionSubscription = this.selectionService.selection$.subscribe(selection => {
      this.selection = selection;
      this.updateDescriptions();
    });
  }

  ngOnDestroy(): void {
    this.selectionSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.message) {
      this.mappedObjects = this.mappingService.map(this.message);
    }
    this.updateDescriptions();
  }

  updateDescriptions() {
    if (!this.selection || !this.message) {
      this.segmentDescription = '';
      this.fieldDescription = null;
      return;
    }

    this.segmentDescription = this.definitionService.getSegmentDescription(this.selection.segment.name, this.message);

    if (this.selection.field && this.selection.fieldIndex) {
      this.fieldDescription = this.definitionService.getFieldDescription(this.selection.segment.name, this.selection.fieldIndex, this.message);
    } else {
      this.fieldDescription = null;
    }
  }

  getComponentDescription(componentIndex: number): any {
    if (this.fieldDescription && this.fieldDescription.comp && this.fieldDescription.comp[componentIndex]) {
      return this.fieldDescription.comp[componentIndex];
    }
    return null;
  }

  getSubComponentDescription(componentIndex: number, subComponentIndex: number): any {
      return { desc: `Sub-Component ${subComponentIndex + 1}` };
  }

  formatValue(value: unknown): string {
    return this.formatService.format(value as string);
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  asObject(value: unknown): { [key: string]: string } {
    return value as { [key:string]: string };
  }
}
