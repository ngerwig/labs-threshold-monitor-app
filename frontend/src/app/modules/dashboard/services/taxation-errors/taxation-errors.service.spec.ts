import { TestBed } from '@angular/core/testing';

import { TaxationErrorsService } from './taxation-errors.service';

describe('TaxationErrorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaxationErrorsService = TestBed.get(TaxationErrorsService);
    expect(service).toBeTruthy();
  });
});
