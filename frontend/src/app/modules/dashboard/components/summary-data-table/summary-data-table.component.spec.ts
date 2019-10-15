import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryDataTableComponent } from './summary-data-table.component';

describe('SummaryDataTableComponent', () => {
  let component: SummaryDataTableComponent;
  let fixture: ComponentFixture<SummaryDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
