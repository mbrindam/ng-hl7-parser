import { Component, Input, OnChanges, SimpleChanges, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hl7Message } from './hl7.model';
import { Hl7ParserService } from './hl7-parser.service';
import { SelectionService } from './selection.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-hl7-parser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hl7-parser.component.html',
  styleUrls: ['./hl7-parser.component.css']
})
export class Hl7ParserComponent implements OnChanges, OnInit, OnDestroy {
  @Input() messageStr: string = '';

  message: Hl7Message | null = null;
  selectedSegment: number | null = null;
  selectedField: number | null = null;
  selectedRepetition: number | null = null;
  selectedComponent: number | null = null;
  selectedSubComponent: number | null = null;

  private selectionSubscription: Subscription | undefined;

  constructor(
    private parser: Hl7ParserService,
    private el: ElementRef,
    private selectionService: SelectionService
  ) { }

  ngOnInit(): void {
    this.selectionSubscription = this.selectionService.selection$.subscribe(selection => {
      this.updateSelection(selection);
    });
  }

  ngOnDestroy(): void {
    this.selectionSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messageStr']) {
      this.message = this.parser.parse(this.messageStr);
      this.clearSelection();
    }
  }

  updateSelection(selection: any) {
    if (selection) {
      this.selectedSegment = selection.segmentIndex ?? null;
      this.selectedField = selection.fieldIndex ?? null;
      this.selectedRepetition = selection.repetitionIndex ?? null;
      this.selectedComponent = selection.componentIndex ?? null;
      this.selectedSubComponent = selection.subComponentIndex ?? null;
      
      setTimeout(() => this.scrollToSelection(selection), 0);
    } else {
      this.clearSelection();
    }
  }
  
  private scrollToSelection(selection: any) {
    let id = `s-${selection.segmentIndex}`;
    if (selection.fieldIndex !== undefined) {
      id += `-f-${selection.fieldIndex}`;
      if (selection.repetitionIndex !== undefined) {
        id += `-r-${selection.repetitionIndex}`;
        if (selection.componentIndex !== undefined) {
          id += `-c-${selection.componentIndex}`;
          if (selection.subComponentIndex !== undefined) {
            id += `-sc-${selection.subComponentIndex}`;
          }
        }
      }
    }
    
    const element = this.el.nativeElement.querySelector(`#${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  clearSelection() {
    this.selectedSegment = null;
    this.selectedField = null;
    this.selectedRepetition = null;
    this.selectedComponent = null;
    this.selectedSubComponent = null;
  }

  selectSegment(segmentIndex: number) {
    if (!this.message) return;
    const selection = {
      segment: this.message.segments[segmentIndex],
      segmentIndex: segmentIndex
    };
    this.selectionService.updateSelection(selection);
  }

  selectField(segmentIndex: number, fieldIndex: number, event: MouseEvent) {
    if (!this.message) return;
    event.stopPropagation();
    const realFieldIndex = fieldIndex + 1;
    const selection = {
      segment: this.message.segments[segmentIndex],
      field: this.message.segments[segmentIndex].fields[realFieldIndex],
      segmentIndex: segmentIndex,
      fieldIndex: realFieldIndex
    };
    this.selectionService.updateSelection(selection);
  }

  selectRepetition(segmentIndex: number, fieldIndex: number, repetitionIndex: number, event: MouseEvent) {
    if (!this.message) return;
    event.stopPropagation();
    const realFieldIndex = fieldIndex + 1;
    const selection = {
      segment: this.message.segments[segmentIndex],
      field: this.message.segments[segmentIndex].fields[realFieldIndex],
      repetition: this.message.segments[segmentIndex].fields[realFieldIndex].repetitions[repetitionIndex],
      segmentIndex: segmentIndex,
      fieldIndex: realFieldIndex,
      repetitionIndex: repetitionIndex
    };
    this.selectionService.updateSelection(selection);
  }

  selectComponent(segmentIndex: number, fieldIndex: number, repetitionIndex: number, componentIndex: number, event: MouseEvent) {
    if (!this.message) return;
    event.stopPropagation();
    const realFieldIndex = fieldIndex + 1;
    const selection = {
      segment: this.message.segments[segmentIndex],
      field: this.message.segments[segmentIndex].fields[realFieldIndex],
      repetition: this.message.segments[segmentIndex].fields[realFieldIndex].repetitions[repetitionIndex],
      component: this.message.segments[segmentIndex].fields[realFieldIndex].repetitions[repetitionIndex].components[componentIndex],
      segmentIndex: segmentIndex,
      fieldIndex: realFieldIndex,
      repetitionIndex: repetitionIndex,
      componentIndex: componentIndex
    };
    this.selectionService.updateSelection(selection);
  }

  selectSubComponent(segmentIndex: number, fieldIndex: number, repetitionIndex: number, componentIndex: number, subComponentIndex: number, event: MouseEvent) {
    if (!this.message) return;
    event.stopPropagation();
    const realFieldIndex = fieldIndex + 1;
    const selection = {
      segment: this.message.segments[segmentIndex],
      field: this.message.segments[segmentIndex].fields[realFieldIndex],
      repetition: this.message.segments[segmentIndex].fields[realFieldIndex].repetitions[repetitionIndex],
      component: this.message.segments[segmentIndex].fields[realFieldIndex].repetitions[repetitionIndex].components[componentIndex],
      subComponent: this.message.segments[segmentIndex].fields[realFieldIndex].repetitions[repetitionIndex].components[componentIndex].subComponents[subComponentIndex],
      segmentIndex: segmentIndex,
      fieldIndex: realFieldIndex,
      repetitionIndex: repetitionIndex,
      componentIndex: componentIndex,
      subComponentIndex: subComponentIndex
    };
    this.selectionService.updateSelection(selection);
  }
}
