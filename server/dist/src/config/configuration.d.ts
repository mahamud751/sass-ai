declare const _default: () => {
    port: number;
    nodeEnv: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    openai: {
        apiKey: string | undefined;
        baseUrl: string;
        model: string;
    };
    uploadDir: string;
};
export default _default;
