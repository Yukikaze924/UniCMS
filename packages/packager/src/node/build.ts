import { BuildContext, BuildOptions } from './types.js';

type BuildOptionsArgument = Partial<BuildOptions>;

function runBuild(ctx: BuildContext): Promise<void>;
function runBuild(ctx: BuildContext, options: Partial<BuildOptions>): Promise<void>;

async function runBuild(ctx: BuildContext, options?: BuildOptionsArgument) {
    const opts: BuildOptions = {
        bundler: 'vite',
        loglevel: 'silent',
        ...(options || {}),
    };

    if (opts.bundler === 'vite') {
        const { build } = await import('./vite/build.js');
        await build(ctx, opts);
    }
}

export { runBuild };
export type { BuildOptions };
