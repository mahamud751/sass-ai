"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT ?? '3001', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    jwt: {
        secret: process.env.JWT_SECRET ?? 'dev-secret',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    },
    uploadDir: process.env.UPLOAD_DIR ?? './uploads',
});
//# sourceMappingURL=configuration.js.map