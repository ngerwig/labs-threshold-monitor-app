import { TestBed, async, inject } from '@angular/core/testing';

import { TaxationDataCanDeactivateGuard } from './taxation-data-can-deactivate.guard';

describe('TaxationDataCanDeactivateGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaxationDataCanDeactivateGuard]
    });
  });

  it('should ...', inject([TaxationDataCanDeactivateGuard], (guard: TaxationDataCanDeactivateGuard) => {
    expect(guard).toBeTruthy();
  }));
});
