import { InlineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { BaseContext, BuildContext, BuildOptions, ServeContext, ServeOptions } from '../types.js';

const resolveBaseConfig = (ctx: BaseContext): InlineConfig => {
    const { appConfigs: app } = ctx;
    return {
        root: app.appDir,
        base: app.basePath,
        build: {
            outDir: app.distDir,
            emptyOutDir: true,
        },
        cacheDir: app.cacheDir,
        configFile: false,
        resolve: {
            alias: {
                '@': path.resolve(app.appDir),
                '@components': path.resolve(app.appDir, 'app', 'components'),
            },
        },
        define: {
            'window.unicms': JSON.stringify(ctx),
        },
        plugins: [react(), tailwindcss()],
        envPrefix: 'UNICMS_',
    };
};

const resolveDevConfig = (ctx: ServeContext, options: ServeOptions): InlineConfig => {
    return {
        ...resolveBaseConfig(ctx),
        server: {
            host: 'localhost',
            port: options.devServer.port,
        },
        logLevel:
            options.loglevel === 'verbose'
                ? 'info'
                : options.loglevel === 'normal'
                  ? 'info'
                  : options.loglevel === 'silent'
                    ? 'silent'
                    : 'info',
    };
};

const resolveProdConfig = (ctx: BuildContext, options: BuildOptions): InlineConfig => {
    return {
        ...resolveBaseConfig(ctx),
        server: {
            host: ctx.server.host,
            port: ctx.server.port,
        },
        logLevel: 'silent',
    };
};

export { resolveBaseConfig, resolveDevConfig, resolveProdConfig };
