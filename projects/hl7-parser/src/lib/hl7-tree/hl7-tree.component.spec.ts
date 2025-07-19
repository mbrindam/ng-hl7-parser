import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hl7TreeComponent } from './hl7-tree.component';

describe('Hl7TreeComponent', () => {
  let component: Hl7TreeComponent;
  let fixture: ComponentFixture<Hl7TreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hl7TreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hl7TreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
