import { TestBed } from '@angular/core/testing';

import { TaxationDataUndoRedoService } from './taxation-data-undo-redo.service';

describe('UndoRedoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaxationDataUndoRedoService = TestBed.get(TaxationDataUndoRedoService);
    expect(service).toBeTruthy();
  });
});
