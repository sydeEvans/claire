import { launch } from '@/index';

describe('test hello', () => {
  it('should success', async () => {
    await launch({
      title: 'claire',
    });
  });
});
