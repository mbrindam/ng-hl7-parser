import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hl7Message, Hl7Segment, Hl7Field, Hl7Repetition, Hl7Component, Hl7SubComponent } from '../hl7.model';
import { Hl7DefinitionService } from '../hl7-definition.service';
import { Hl7FormatService } from '../hl7-format.service';
import { SelectionService } from '../selection.service';
import { Subscription } from 'rxjs';

interface TreeNode {
  label: string;
  data: any;
  children: TreeNode[];
  expanded: boolean;
  level: number;
  selected?: boolean;
}

@Component({
  selector: 'lib-hl7-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hl7-tree.component.html',
  styleUrls: ['./hl7-tree.component.css'],
  providers: [Hl7DefinitionService, Hl7FormatService]
})
export class Hl7TreeComponent implements OnChanges, OnInit, OnDestroy {
  @Input() message: Hl7Message | null = null;

  tree: TreeNode | null = null;
  private selectionSubscription: Subscription | undefined;
  private lastSelection: any = null;

  constructor(
    private definitionService: Hl7DefinitionService,
    private formatService: Hl7FormatService,
    private selectionService: SelectionService
  ) {}

  ngOnInit(): void {
    this.selectionSubscription = this.selectionService.selection$.subscribe(selection => {
      this.lastSelection = selection;
      if (this.tree) {
        this.updateTreeSelection(this.tree, selection);
        this.tree = { ...this.tree };
      }
    });
  }

  ngOnDestroy(): void {
    this.selectionSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && this.message) {
      this.tree = this.buildTree(this.message);
      if (this.lastSelection) {
        this.updateTreeSelection(this.tree, this.lastSelection);
        this.tree = { ...this.tree };
      }
    }
  }

  private updateTreeSelection(node: TreeNode, selection: any | null): boolean {
    const matchLevel = this.getNodeMatchLevel(node, selection);
    
    let childIsOrHasMatch = false;
    if (node.children) {
      for (const child of node.children) {
        if (this.updateTreeSelection(child, selection)) {
          childIsOrHasMatch = true;
        }
      }
    }
    
    node.selected = matchLevel > 0 && !childIsOrHasMatch;
    node.expanded = (node.level === 0) || childIsOrHasMatch;
    
    return matchLevel > 0 || childIsOrHasMatch;
  }

  private getNodeMatchLevel(node: TreeNode, selection: any): number {
    if (!selection || !node.data) return 0;
    const nodeData = node.data;

    if (nodeData.segmentIndex !== selection.segmentIndex) return 0;
    if (nodeData.fieldIndex !== selection.fieldIndex) return nodeData.fieldIndex === undefined ? 1 : 0;
    if (nodeData.repetitionIndex !== selection.repetitionIndex) return nodeData.repetitionIndex === undefined ? 2 : 0;
    if (nodeData.componentIndex !== selection.componentIndex) return nodeData.componentIndex === undefined ? 3 : 0;
    if (nodeData.subComponentIndex !== selection.subComponentIndex) return nodeData.subComponentIndex === undefined ? 4 : 0;

    return 5; // Full match
  }

  private isNodeExactMatch(node: TreeNode, selection: any): boolean {
    return this.getNodeMatchLevel(node, selection) === this.getSelectionLevel(selection);
  }

  private getSelectionLevel(data: any): number {
    if (data.subComponentIndex !== undefined) return 5;
    if (data.componentIndex !== undefined) return 4;
    if (data.repetitionIndex !== undefined) return 3;
    if (data.fieldIndex !== undefined) return 2;
    if (data.segmentIndex !== undefined) return 1;
    return 0;
  }

  private buildTree(message: Hl7Message): TreeNode {
    const messageType = message.segments.find((s: Hl7Segment) => s.name === 'MSH')?.fields[8]?.repetitions[0]?.components[0]?.original || 'HL7 Message';
    return {
      label: messageType,
      data: { segment: message.segments[0], segmentIndex: 0 },
      expanded: true,
      level: 0,
      children: message.segments.map((segment, i) => this.buildSegmentNode(segment, i, 1))
    };
  }

  private buildSegmentNode(segment: Hl7Segment, segmentIndex: number, level: number): TreeNode {
    const desc = this.definitionService.getSegmentDescription(segment.name, { segments: [segment] });
    return {
      label: `${segment.name}: ${desc}`,
      data: { segment, segmentIndex },
      expanded: false,
      level,
      children: segment.fields.map((field, i) => this.buildFieldNode(segment, field, segmentIndex, i, level + 1))
    };
  }

  private buildFieldNode(segment: Hl7Segment, field: Hl7Field, segmentIndex: number, fieldIndex: number, level: number): TreeNode {
    const fieldDef = this.definitionService.getFieldDescription(segment.name, fieldIndex, { segments: [segment] });
    let label = `${segment.name}-${fieldIndex}: ${fieldDef?.desc || ''}`;
    if (field.repetitions.length === 1 && field.repetitions[0].components.length === 1 && field.repetitions[0].components[0].subComponents.length === 1) {
      label += ` - ${this.formatService.format(field.original)}`;
    }
    return {
      label,
      data: { segment, field, segmentIndex, fieldIndex },
      expanded: false,
      level,
      children: (field.repetitions.length > 1 || (field.repetitions[0] && field.repetitions[0].components.length > 1))
        ? field.repetitions.map((rep, i) => this.buildRepetitionNode(segment, field, rep, segmentIndex, fieldIndex, i, level + 1))
        : []
    };
  }

  private buildRepetitionNode(segment: Hl7Segment, field: Hl7Field, repetition: Hl7Repetition, segmentIndex: number, fieldIndex: number, repetitionIndex: number, level: number): TreeNode {
    let label = `Repetition ${repetitionIndex + 1}`;
    if (repetition.components.length === 1 && repetition.components[0].subComponents.length === 1) {
      label += `: ${this.formatService.format(repetition.original)}`;
    }
    return {
      label,
      data: { segment, field, repetition, segmentIndex, fieldIndex, repetitionIndex },
      expanded: false,
      level,
      children: (repetition.components.length > 1 || (repetition.components[0] && repetition.components[0].subComponents.length > 1))
        ? repetition.components.map((comp, i) => this.buildComponentNode(segment, field, repetition, comp, segmentIndex, fieldIndex, repetitionIndex, i, level + 1))
        : []
    };
  }

  private buildComponentNode(segment: Hl7Segment, field: Hl7Field, repetition: Hl7Repetition, component: Hl7Component, segmentIndex: number, fieldIndex: number, repetitionIndex: number, componentIndex: number, level: number): TreeNode {
    const fieldDef = this.definitionService.getFieldDescription(segment.name, fieldIndex, { segments: [segment] });
    const compDef = fieldDef?.comp?.[componentIndex];
    let label = `${componentIndex + 1}: ${compDef?.desc || 'Component'}`;
    if (component.subComponents.length === 1) {
        label += ` - ${this.formatService.format(component.original)}`;
    }
    return {
      label,
      data: { segment, field, repetition, component, segmentIndex, fieldIndex, repetitionIndex, componentIndex },
      expanded: false,
      level,
      children: component.subComponents.length > 1
        ? component.subComponents.map((sub, i) => this.buildSubComponentNode(segment, field, repetition, component, sub, segmentIndex, fieldIndex, repetitionIndex, componentIndex, i, level + 1))
        : []
    };
  }

  private buildSubComponentNode(segment: Hl7Segment, field: Hl7Field, repetition: Hl7Repetition, component: Hl7Component, subComponent: Hl7SubComponent, segmentIndex: number, fieldIndex: number, repetitionIndex: number, componentIndex: number, subComponentIndex: number, level: number): TreeNode {
    const label = `Sub-Component ${subComponentIndex + 1}: ${this.formatService.format(subComponent.original)}`;
    return {
      label,
      data: { segment, field, repetition, component, subComponent, segmentIndex, fieldIndex, repetitionIndex, componentIndex, subComponentIndex },
      expanded: false,
      level,
      children: []
    };
  }

  toggleNode(node: TreeNode): void {
    node.expanded = !node.expanded;
  }

  selectNode(node: TreeNode, event: MouseEvent): void {
    event.stopPropagation();
    this.selectionService.updateSelection(node.data);
  }

  isNodeEmpty(node: TreeNode): boolean {
    if (node.children.length > 0) return false;

    const data = node.data;
    if (data.subComponent) return !data.subComponent.original;
    if (data.component) return !data.component.original;
    if (data.repetition) return !data.repetition.original;
    if (data.field) return !data.field.original;
    
    return false;
  }
}
