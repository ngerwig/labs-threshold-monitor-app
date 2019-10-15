import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { USStatesMapComponent } from './us-states-map.component';

describe('USStatesMapComponent', () => {
  let component: USStatesMapComponent;
  let fixture: ComponentFixture<USStatesMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ USStatesMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(USStatesMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
