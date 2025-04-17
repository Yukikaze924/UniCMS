import { services } from '@unicms/ioc';
import path from 'node:path';
import type { EnvConfiguration } from '@unicms/types';
import { UnicmsApp } from '@/lib/services/core';

export default async function serve({ env, dev }: { env: EnvConfiguration; dev: boolean }) {
    const dir = process.cwd();

    const app = new UnicmsApp({
        appConfigs: {
            appDir: services.get<string>('APP_DIR'),
            basePath: '',
            cwd: dir,
            runtimeDir: dir,
            distDir: path.resolve(dir, '.unicms'),
            cacheDir: path.resolve(dir, '.cache'),
            apiDir: path.resolve(dir, 'api'),
            statsDir: path.resolve(dir, 'stats'),
        },
        server: {
            host: env.HOST_ADDR,
            port: env.HOST_PORT,
            protocol: env.HOST_PROTOCOL,
        },
        env: env,
        dev: dev,
    });

    await app.run();
}
