import { BuildContext, BuildOptions } from '../types.js';
import { resolveProdConfig } from './config.js';

const build = async (ctx: BuildContext, options: BuildOptions) => {
    const config = resolveProdConfig(ctx, options);
    const { build } = await import('vite');
    await build(config);
};

export { build };
