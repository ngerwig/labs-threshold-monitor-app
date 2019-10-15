import { TestBed } from '@angular/core/testing';

import { TaxationDataService } from './taxation-data.service';

describe('TaxationDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaxationDataService = TestBed.get(TaxationDataService);
    expect(service).toBeTruthy();
  });
});
