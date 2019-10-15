import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatesGuideComponent } from './states-guide.component';

describe('StatesGuideComponent', () => {
  let component: StatesGuideComponent;
  let fixture: ComponentFixture<StatesGuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatesGuideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatesGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
