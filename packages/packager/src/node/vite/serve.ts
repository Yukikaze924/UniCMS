import { resolveDevConfig } from './config.js';
import { ServeContext, ServeOptions } from '../types.js';

// 函数实现
async function serve(ctx: ServeContext, options: ServeOptions): Promise<void> {
    const config = resolveDevConfig(ctx, options);
    const { createServer } = await import('vite');
    const server = await createServer(config);
    await server.listen();
}

export { serve };
