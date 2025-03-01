import { build } from 'esbuild';
import path, { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const entryPoint = resolve(__dirname, '../bin/unicms.ts');
const outFile = resolve(__dirname, '../dist/unicms.mjs');

build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    outfile: outFile,
    target: 'node16',
    format: 'esm',
    external: [], // 将路径标记为外部依赖
    plugins: [nodeExternalsPlugin()],
    alias: {
        '@/lib': path.resolve('lib'),
    },
}).catch(() => process.exit(1));
