import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordVerificationComponent } from './reset-password-verification.component';

describe('ResetPasswordVerificationComponent', () => {
  let component: ResetPasswordVerificationComponent;
  let fixture: ComponentFixture<ResetPasswordVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
