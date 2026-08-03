import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { UploadsController, UPLOADS_DIR } from './uploads.controller';

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

import { mkdir, writeFile } from 'node:fs/promises';

describe('UploadsController', () => {
  let controller: UploadsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://api.test') },
        },
      ],
    }).compile();

    controller = moduleRef.get(UploadsController);
    jest.clearAllMocks();
  });

  it('should store the file under a random name and return its public URL', async () => {
    const file = {
      mimetype: 'image/png',
      originalname: 'photo of range.PNG',
      buffer: Buffer.from('fake-image-bytes'),
    } as Express.Multer.File;

    const result = await controller.upload(file);

    expect(result.url).toMatch(/^http:\/\/api\.test\/uploads\/[0-9a-f-]{36}\.png$/);
    expect(mkdir).toHaveBeenCalledWith(UPLOADS_DIR, { recursive: true });
    const [writtenPath, writtenBuffer] = (writeFile as jest.Mock).mock.calls[0] as [string, Buffer];
    expect(writtenPath.startsWith(UPLOADS_DIR)).toBe(true);
    // The random name must come from the validated mimetype, not the client filename.
    expect(writtenPath).not.toContain('photo');
    expect(writtenBuffer).toEqual(file.buffer);
  });

  it('should derive the extension from the mimetype', async () => {
    const file = {
      mimetype: 'image/webp',
      originalname: 'x.png',
      buffer: Buffer.from(''),
    } as Express.Multer.File;

    const result = await controller.upload(file);

    expect(result.url).toMatch(/\.webp$/);
  });
});
