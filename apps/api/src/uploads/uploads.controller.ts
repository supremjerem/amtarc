import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// Extension comes from the validated content type, never the client filename.
const EXTENSION_BY_MIMETYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

@Controller('uploads')
export class UploadsController {
  constructor(private readonly config: ConfigService) {}

  @UseGuards(JwtAuthGuard)
  // Memory storage so the validators can check the file's magic bytes;
  // the file is only written to disk once validation has passed.
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const filename = `${randomUUID()}${EXTENSION_BY_MIMETYPE[file.mimetype] ?? ''}`;
    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(join(UPLOADS_DIR, filename), file.buffer);

    const publicUrl = this.config.get<string>('API_PUBLIC_URL');
    return { url: `${publicUrl}/uploads/${filename}` };
  }
}
