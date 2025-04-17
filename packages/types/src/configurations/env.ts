type EnvConfiguration = {
    HOST_PROTOCOL: 'http' | 'https';
    HOST_ADDR: string;
    HOST_PORT: number;
    UNICMS_DIR: string;
    DATABASE_URL: string;
    API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
    NO_WEBUI: boolean;
    CACHE_TIME_TO_LIVE_SECONDS: string;
};

export type { EnvConfiguration };
