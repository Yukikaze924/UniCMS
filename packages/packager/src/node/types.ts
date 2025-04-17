import { BaseContext, LogLevelOption, ServerConfiguration } from '@unicms/types';

interface BuildContext extends BaseContext {}

interface ServeContext extends BaseContext {}

interface BaseOptions {
    /**
     * Which bundler to use for building.
     *
     * @default vite
     */
    bundler: 'vite' | 'webpack' | 'rollup' | 'esbuild';
    /**
     * Decided which information will be printed out.
     *
     * @default verbose
     */
    loglevel: LogLevelOption;
}

interface BuildOptions extends BaseOptions {}

interface ServeOptions extends BaseOptions {
    devServer: Pick<ServerConfiguration, 'port'>;
}

export type { BaseContext, BuildContext, ServeContext, BaseOptions, BuildOptions, ServeOptions };
