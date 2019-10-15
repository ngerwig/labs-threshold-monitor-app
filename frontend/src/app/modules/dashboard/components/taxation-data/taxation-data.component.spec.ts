import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxationDataComponent } from './taxation-data.component';

describe('TaxationDataComponent', () => {
  let component: TaxationDataComponent;
  let fixture: ComponentFixture<TaxationDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxationDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxationDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
