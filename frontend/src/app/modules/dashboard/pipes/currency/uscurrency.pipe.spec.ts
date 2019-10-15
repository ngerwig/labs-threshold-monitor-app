import { USCurrencyPipe } from './uscurrency.pipe';

describe('USCurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new USCurrencyPipe();
    expect(pipe).toBeTruthy();
  });
});
