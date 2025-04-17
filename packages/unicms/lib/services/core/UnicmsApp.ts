import path from 'node:path';
import { padStrings } from '@unicms/helpers/string';
import chalk from 'chalk';
import ora from 'ora';
import { performance } from 'node:perf_hooks';
import express, { Application, Router } from 'express';
import cors from 'cors';
import Logger from '@/lib/util/logger';
import type { BaseContext, EnvConfiguration, ServerConfiguration, UnicmsAppConfiguration } from '@unicms/types';
import { services } from '@unicms/ioc';
import { runServe } from '@unicms/packager';
import { createDatabaseConnection } from '@/lib/util/db';
import { MysqlStorage, StatisticService } from '../storage';
import { ExpressRouter } from '../router';
import { ControllerService } from '.';
import { RESTfulRouteService } from '.';

type UnicmsAppConstructorArgs = BaseContext & {
    plugins?: any[];
};

class UnicmsApp {
    protected readonly app: Application;
    protected readonly appConfigs: UnicmsAppConfiguration;
    protected readonly server: ServerConfiguration;
    protected readonly env: EnvConfiguration;
    protected readonly dev: boolean;

    protected readonly plugins?: any[];

    #_ready_time_ms: number = performance.now();

    constructor({ appConfigs: configs, server, env, dev }: UnicmsAppConstructorArgs) {
        this.app = express();
        this.appConfigs = configs;
        this.server = server;
        this.env = env;
        this.dev = dev;

        services
            .register('env', this.env)
            .register('storage', new MysqlStorage(createDatabaseConnection(this.env.DATABASE_URL)))
            .register('stats', new StatisticService(this.appConfigs.statsDir));
    }

    public async run() {
        const app = this.appConfigs;

        !this.dev && console.clear();

        const spinner = ora(` starting the ${this.dev ? 'development' : 'production'} server...\n`).start();

        this.app.use(express.json());
        this.app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));

        const router = new ExpressRouter(Router());
        const controllerService = new ControllerService(router);
        const routeService = new RESTfulRouteService(router, this.appConfigs.apiDir);

        services.register('routeService', routeService);

        try {
            await routeService.createFileBasedRoutes(app.apiDir);

            await controllerService.registerRESTfulRoutes();
            await controllerService.registerRPCRoutes();
            this.app.use('/api', controllerService.serve());
        } catch (error) {
            spinner.stop();
            Logger.error((error as Error).message);
            process.exit(1);
        }

        spinner.stop();
        this.startServer();
    }

    private startServer() {
        const app = this.appConfigs;
        if (!this.env.NO_WEBUI) {
            if (this.dev) {
                runServe(
                    {
                        appConfigs: this.appConfigs,
                        server: this.server,
                        env: this.env,
                        dev: this.dev,
                    },
                    {
                        devServer: {
                            port: 7642,
                        },
                        loglevel: 'verbose',
                    }
                );
            } else {
                this.app.use(express.static(app.distDir));
                this.app.get('*', (_, res) => {
                    res.sendFile(path.join(app.distDir, 'index.html'));
                });
            }
        }
        this.app.listen(this.server.port, this.server.host, () => {
            this.displayStartupInfo();
        });
    }

    private displayStartupInfo() {
        const { appConfigs: app } = this;
        this.#_ready_time_ms = performance.now() - this.#_ready_time_ms;

        const [title, loginfo] = padStrings(
            '🚀 UniCMS server is running!',
            this.dev ? '🔴 DEV ONLY, DO NOT USE THIS IN PRODUCTION' : '🟢 PRODUCTION READY'
        );

        // Default
        console.log(chalk.yellow.inverse(title));
        this.dev ? console.log(chalk.red.inverse(loginfo)) : console.log(chalk.green.inverse(loginfo));
        console.log();
        console.log(chalk.cyan('Learn more: https://learn.microsoft.com/en-us/unicms/'));
        console.log();
        console.log(`${chalk.green('ready in')} ${chalk.bold(this.#_ready_time_ms.toFixed(2))} ${chalk.green('ms')}`);
        console.log();
        console.log(chalk.yellowBright('  📦 Project directory:        ') + `${app.runtimeDir}`);
        console.log();
        console.log(
            chalk.blueBright('  🌐 Server address:           ') + `http://${this.server.host}:${this.server.port}`
        );
        console.log();
        console.log(chalk.magentaBright('  🌈 Database URL:             ') + this.env.DATABASE_URL);
        console.log('\n');
    }
}

export { UnicmsApp };
export type { UnicmsAppConstructorArgs, UnicmsAppConfiguration };
