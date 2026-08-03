import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RevalidateService {
  private readonly logger = new Logger(RevalidateService.name);

  constructor(private readonly config: ConfigService) {}

  // Best-effort: a failed webhook only delays the ISR refresh (5-minute safety net).
  async notify(tag: string) {
    const url = this.config.get<string>('WEB_REVALIDATE_URL');
    const secret = this.config.get<string>('REVALIDATE_SECRET');
    try {
      await fetch(url!, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secret, tag }),
      });
    } catch (error) {
      this.logger.warn(`Failed to notify web app for revalidation: ${String(error)}`);
    }
  }
}
