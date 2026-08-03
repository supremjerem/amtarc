import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

// Thin transactional-mail sender. MAIL_DRIVER=log (default) prints to the
// application log; MAIL_DRIVER=resend posts to the Resend HTTP API (no SDK
// needed). Sending never throws: a lost email must not fail the request that
// triggered it.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async send(message: MailMessage): Promise<void> {
    if (this.config.get<string>('MAIL_DRIVER') !== 'resend') {
      this.logger.log(`[mail] to=${message.to} subject="${message.subject}"\n${message.text}`);
      return;
    }
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.config.get<string>('RESEND_API_KEY')}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          from: this.config.get<string>('MAIL_FROM'),
          to: message.to,
          subject: message.subject,
          text: message.text,
        }),
      });
      if (!response.ok) {
        this.logger.warn(`Mail delivery failed (${response.status}) for "${message.subject}"`);
      }
    } catch (error) {
      this.logger.warn(`Mail delivery failed: ${String(error)}`);
    }
  }
}
