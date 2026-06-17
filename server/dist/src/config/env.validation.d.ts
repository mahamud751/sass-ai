declare class EnvironmentVariables {
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    OPENAI_API_KEY?: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
