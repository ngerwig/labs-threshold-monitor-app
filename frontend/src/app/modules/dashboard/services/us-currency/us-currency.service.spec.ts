import { TestBed } from '@angular/core/testing';

import { UsCurrencyService } from './us-currency.service';

describe('UsCurrencyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UsCurrencyService = TestBed.get(UsCurrencyService);
    expect(service).toBeTruthy();
  });
});
