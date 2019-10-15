import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StateGraphComponent } from './state-graph.component';

describe('StateGraphComponent', () => {
  let component: StateGraphComponent;
  let fixture: ComponentFixture<StateGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
