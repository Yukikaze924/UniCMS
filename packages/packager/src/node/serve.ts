import { RequiredSubset } from '@unicms/types';
import { ServeContext, ServeOptions } from './types.js';

type ServeOptionsArgument = RequiredSubset<ServeOptions, 'devServer'>;

function runServe(ctx: ServeContext): Promise<void>;
function runServe(ctx: ServeContext, options: ServeOptionsArgument): Promise<void>;

async function runServe(ctx: ServeContext, options?: ServeOptionsArgument) {
    const opts: ServeOptions = {
        bundler: 'vite',
        loglevel: 'verbose',
        devServer: {
            port: 7642,
        },
        ...(options || {}),
    };

    if (opts.bundler === 'vite') {
        const { serve } = await import('./vite/serve.js');
        await serve(ctx, opts);
    }
}

export { runServe };
export type { ServeOptions };
