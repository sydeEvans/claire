import { findChrome } from './findChrome';

describe('test findChrome', () => {
  it('should find success', () => {
    const data = findChrome();
    expect(typeof data).toEqual('string');
  });
});
