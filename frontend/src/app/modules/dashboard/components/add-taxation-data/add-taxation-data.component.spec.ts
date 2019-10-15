import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaxationDataComponent } from './add-taxation-data.component';

describe('ImportComponent', () => {
  let component: AddTaxationDataComponent;
  let fixture: ComponentFixture<AddTaxationDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTaxationDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTaxationDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
