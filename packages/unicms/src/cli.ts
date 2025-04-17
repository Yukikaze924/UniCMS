import { services } from '@unicms/ioc';
import { Command } from 'commander';
import { cwd } from 'node:process';
import packageJson from '@/package.json';
import path, { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { safeParseEnv } from '@/lib/validators/env';

const __dirname = dirname(fileURLToPath(import.meta.url));

const program = new Command();

services.register('APP_DIR', path.resolve(__dirname, '..')).register('RUNTIME_DIR', cwd());

program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version)
    .usage('<COMMAND> [OPTIONS]')
    .action(async () => {
        const env = safeParseEnv(process.env);
        (await import('../src/serve')).default({
            env: env,
            dev: env.NODE_ENV === 'production' ? false : true,
        });
    });

// serve
program
    .command('serve')
    .description('serve the application, suitable for development or production')
    .action(async () => {
        const env = safeParseEnv(process.env);
        (await import('../src/serve')).default({
            env: env,
            dev: env.NODE_ENV === 'production' ? false : true,
        });
    });

// build
program
    .command('build')
    .description('create optimized, high-performance build')
    .action(async () => {
        process.env.NODE_ENV = 'production';
        const env = safeParseEnv(process.env);
        (await import('../src/build')).default({
            env: env,
        });
    });

// init
program
    .command('init')
    .alias('new')
    .description('run application initialization wizard')
    .action(async () => {
        (await import('../src/init')).default();
    });

// run
program
    .command('run <script>')
    .alias('debug')
    .alias('test')
    .description('run dedicated script')
    .action(async (script: string) => {
        const scriptsDir = path.resolve(cwd(), 'scripts');
        try {
            await import(pathToFileURL(path.join(scriptsDir, script)).href);
        } catch (error) {
            console.error('Failed to import script:', error);
        }
    });

program.parse(process.argv);
