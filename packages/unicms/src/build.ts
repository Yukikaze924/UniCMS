import { services } from '@unicms/ioc';
import path from 'path';
import { runBuild } from '@unicms/packager';
import chalk from 'chalk';
import type { EnvConfiguration } from '@unicms/types';
import ora from 'ora';
import { performance } from 'node:perf_hooks';

export default async function build({ env }: { env: EnvConfiguration }) {
    const begin_time_ms = performance.now();
    const spinner = ora(' creating optimized production build...').start();

    try {
        const dir = process.cwd();
        await runBuild(
            {
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
                dev: false,
            },
            {
                loglevel: 'silent',
            }
        );
        const built_time_sec = ((performance.now() - begin_time_ms) / 1000).toFixed(2);
        printDone(built_time_sec);
    } catch (error) {
        printError(error);
        process.exit(1);
    }

    spinner.stop();
}

const printDone = (seconds: string | number) => {
    console.clear();
    console.log(chalk.green(`✔ built in ${seconds}s`));
};

const printError = (message: any) => {
    console.clear();
    console.error(message);
    console.log(chalk.red.inverse('❌ failed to complete.'));
};
