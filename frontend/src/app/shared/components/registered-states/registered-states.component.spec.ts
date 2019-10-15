import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredStatesComponent } from './registered-states.component';

describe('RegisteredStatesComponent', () => {
  let component: RegisteredStatesComponent;
  let fixture: ComponentFixture<RegisteredStatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisteredStatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisteredStatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
