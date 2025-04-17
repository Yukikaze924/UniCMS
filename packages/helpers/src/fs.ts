import fs from 'fs/promises';
import path from 'path';
import { getExtension } from './string.js';
import { existsSync } from 'fs';

export async function fetchDirectoryContents(dirpath: string, showAll: boolean = false) {
    if (!dirpath) return;

    const results: any[] = [];

    async function readDir(_dirpath: string) {
        const items = await fs.readdir(_dirpath);

        for (const item of items) {
            if (!showAll && isHidden(item)) {
                continue;
            }

            const fullPath = path.resolve(_dirpath, item);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                let type = 'directory';
                let props: any = {};

                if (existsSync(path.resolve(fullPath, 'imdb.config.json'))) {
                    type = 'imdb';
                } else if (existsSync(path.resolve(fullPath, 'schema.json'))) {
                    type = 'schema';
                    props.schemaFilePath = path.resolve(fullPath, 'schema.json');
                }

                results.push({ type, path: fullPath, name: item, ...props });
            } else {
                results.push({ type: 'file', path: fullPath, name: item, ext: getExtension(item) });
            }
        }
    }

    await readDir(dirpath);

    return results;
}

export function convertToUnixPath(path) {
    return path.replace(/\\/g, '/');
}

export function isHidden(name: string) {
    if (name.startsWith('.', 0)) return true;
    else return false;
}
