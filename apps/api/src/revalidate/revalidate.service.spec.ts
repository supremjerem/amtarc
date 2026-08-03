import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { RevalidateService } from './revalidate.service';

describe('RevalidateService', () => {
  let service: RevalidateService;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const moduleRef = await Test.createTestingModule({
      providers: [
        RevalidateService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                WEB_REVALIDATE_URL: 'http://web.test/api/revalidate',
                REVALIDATE_SECRET: 'test-secret',
              })[key],
          },
        },
      ],
    }).compile();

    service = moduleRef.get(RevalidateService);
  });

  it('should post the secret and tag to the webhook', async () => {
    await service.notify('content');

    expect(fetchMock).toHaveBeenCalledWith('http://web.test/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: 'test-secret', tag: 'content' }),
    });
  });

  it('should swallow webhook failures', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(service.notify('news')).resolves.toBeUndefined();
  });
});
