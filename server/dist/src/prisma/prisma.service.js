"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    getDatabaseInfo() {
        const url = process.env.DATABASE_URL || '';
        try {
            const u = new URL(url.replace('postgresql://', 'http://'));
            const db = u.pathname.replace('/', '') || '(none)';
            const user = u.username || 'unknown';
            const host = u.hostname;
            const port = u.port;
            return { db, user, host, port, rawUrl: url };
        }
        catch {
            return { db: '(parse error)', user: '', host: '', port: '', rawUrl: url };
        }
    }
    async onModuleInit() {
        const info = this.getDatabaseInfo();
        try {
            await this.$connect();
            this.logger.log(`✅ Successfully connected to PostgreSQL database "${info.db}"`);
        }
        catch (error) {
            this.logger.error('❌ Failed to connect to database');
            this.logger.error(`Target: postgresql://${info.user}:****@${info.host}:${info.port}/${info.db}\n\n` +
                'The database does not exist yet.\n\n' +
                'Run these commands in your terminal:\n' +
                '  cd server\n\n' +
                `  # Create the database (recommended for your user pino)\n` +
                `  createdb -U ${info.user} -O ${info.user} ${info.db}\n\n` +
                `  # If that fails, try as postgres superuser:\n` +
                `  psql -U postgres -c "CREATE DATABASE ${info.db} OWNER ${info.user};"\n\n` +
                '  # Then push the schema\n' +
                '  npm run db:push\n\n' +
                'After that, restart the server.');
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map