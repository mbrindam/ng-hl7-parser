import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hl7ParserComponent } from './hl7-parser.component';

describe('Hl7ParserComponent', () => {
  let component: Hl7ParserComponent;
  let fixture: ComponentFixture<Hl7ParserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hl7ParserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hl7ParserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
