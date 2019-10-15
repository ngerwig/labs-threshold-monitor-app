import { TestBed, async, inject } from '@angular/core/testing';

import { SigninGuard } from './signin.guard';

describe('SigninGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SigninGuard]
    });
  });

  it('should ...', inject([SigninGuard], (guard: SigninGuard) => {
    expect(guard).toBeTruthy();
  }));
});
