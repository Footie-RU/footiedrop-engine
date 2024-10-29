import { Column } from 'typeorm';

export class Settings {
  @Column({ default: 'en' })
  language: string;

  @Column({ default: true })
  notificationsEmail: boolean;

  @Column({ default: true })
  notificationsSms: boolean;

  @Column({ type: 'text', default: '0,0,0,0', nullable: false })
  permission: string;

  @Column({ default: false, nullable: true })
  securityTwoFactorAuth: boolean;

  @Column({ default: false })
  verified: boolean;
}
