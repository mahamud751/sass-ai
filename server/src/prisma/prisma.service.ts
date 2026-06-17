import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  private getDatabaseInfo() {
    const url = process.env.DATABASE_URL || '';
    try {
      const u = new URL(url.replace('postgresql://', 'http://'));
      const db = u.pathname.replace('/', '') || '(none)';
      const user = u.username || 'unknown';
      const host = u.hostname;
      const port = u.port;
      return { db, user, host, port, rawUrl: url };
    } catch {
      return { db: '(parse error)', user: '', host: '', port: '', rawUrl: url };
    }
  }

  async onModuleInit() {
    const info = this.getDatabaseInfo();

    try {
      await this.$connect();
      this.logger.log(`✅ Successfully connected to PostgreSQL database "${info.db}"`);
    } catch (error: any) {
      this.logger.error('❌ Failed to connect to database');
      this.logger.error(
        `Target: postgresql://${info.user}:****@${info.host}:${info.port}/${info.db}\n\n` +
        'The database does not exist yet.\n\n' +
        'Run these commands in your terminal:\n' +
        '  cd server\n\n' +
        `  # Create the database (recommended for your user pino)\n` +
        `  createdb -U ${info.user} -O ${info.user} ${info.db}\n\n` +
        `  # If that fails, try as postgres superuser:\n` +
        `  psql -U postgres -c "CREATE DATABASE ${info.db} OWNER ${info.user};"\n\n` +
        '  # Then push the schema\n' +
        '  npm run db:push\n\n' +
        'After that, restart the server.'
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
