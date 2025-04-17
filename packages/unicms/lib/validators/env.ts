import { cwd } from 'node:process';
import { z } from 'zod';
import Logger from '../util/logger';
import type { EnvConfiguration } from '@unicms/types';

const envSchema = z
    .object({
        HOST_ADDR: z.string().optional(),
        HOST_PORT: z
            .string()
            .transform((val) => parseInt(val, 10))
            .optional(),
        HOST_PROTOCOL: z
            .string()
            .optional()
            .transform((val) => {
                if (!val) return undefined;
                const cleaned = val.toLowerCase().replace(/[^\w]|http(s?)/g, (match) => {
                    return match.startsWith('http') ? match : '';
                });
                const matches = cleaned.match(/^https?/);
                return matches ? matches[0] : 'http';
            })
            .refine((val) => !val || ['http', 'https'].includes(val), 'Invalid protocol'),
        UNICMS_URL: z
            .string()
            .url()
            .optional()
            .refine((url) => !url || ['http:', 'https:'].includes(new URL(url).protocol), {
                message: 'UNICMS_URL protocol must be http or https',
            }),
        UNICMS_DIR: z.string().default(cwd()),
        DATABASE_URL: z.string().default('mysql://root:@localhost:3306/unicms'),
        API_KEY: z.string().default('your_api_key'),
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
        NO_WEBUI: z
            .enum(['false', 'true'])
            .default('false')
            .transform((val) => JSON.parse(val) as boolean),
        CACHE_TIME_TO_LIVE_SECONDS: z.string().default('3600'),
    })
    .passthrough()
    .superRefine((val, ctx) => {
        const hasExplicitHost =
            val.HOST_PROTOCOL !== undefined || val.HOST_ADDR !== undefined || val.HOST_PORT !== undefined;

        if (val.UNICMS_URL && hasExplicitHost) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Cannot combine UNICMS_URL with explicit HOST_* parameters',
                path: ['UNICMS_URL'],
            });
        }
    })
    .transform((val) => {
        if (val.UNICMS_URL) {
            const url = new URL(val.UNICMS_URL);
            return {
                ...val,
                HOST_PROTOCOL: url.protocol.replace(':', ''),
                HOST_ADDR: url.hostname,
                HOST_PORT: url.port ? parseInt(url.port, 10) : url.protocol === 'https:' ? 443 : 80,
            };
        }

        return {
            ...val,
            HOST_PROTOCOL: val.HOST_PROTOCOL ?? 'http',
            HOST_ADDR: val.HOST_ADDR ?? '127.0.0.1',
            HOST_PORT: val.HOST_PORT ?? 3000,
        };
    });

const parseEnv = (obj: object) => envSchema.parse(obj) as EnvConfiguration;

const safeParseEnv = (obj: object) => {
    const result = envSchema.safeParse(obj);
    if (result.success) {
        return result.data as EnvConfiguration;
    } else {
        Logger.error('failed to parse Env file!\n' + result.error);
        process.exit(1);
    }
};

export { envSchema, parseEnv, safeParseEnv };
