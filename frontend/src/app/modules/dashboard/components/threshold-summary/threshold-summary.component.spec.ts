import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThresholdSummaryComponent } from './threshold-summary.component';

describe('ThresholdSummaryComponent', () => {
  let component: ThresholdSummaryComponent;
  let fixture: ComponentFixture<ThresholdSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThresholdSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThresholdSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
