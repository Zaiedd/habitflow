import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('EMAIL_HOST');
    if (!host) {
      this.transporter = null;
      return;
    }

    const user = this.config.get<string>('EMAIL_USER');
    const pass = this.config.get<string>('EMAIL_PASS');
    const transport: {
      host: string;
      port: number;
      secure: boolean;
      auth?: { user: string; pass: string };
    } = {
      host,
      port: Number(this.config.get('EMAIL_PORT') ?? 587),
      secure: this.config.get('EMAIL_SECURE') === 'true',
    };
    if (user && pass) {
      transport.auth = { user, pass };
    }
    this.transporter = nodemailer.createTransport(transport);
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  private get from(): string {
    return this.config.get<string>('EMAIL_FROM') ?? 'no-reply@habitflow.app';
  }

  async send(input: SendMailInput): Promise<void> {
    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
      return;
    }

    this.logger.log(
      `[dev-mail] to=${input.to} subject="${input.subject}"` +
        `\n${input.text}\n`,
    );
  }
}
