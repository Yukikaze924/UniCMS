import path from 'node:path';
import { Call, RPCService } from '../decorators';
import fs from 'fs/promises';
import { fetchDirectoryContents } from '@unicms/helpers/fs';

@RPCService('fs')
export class FileSystemService {
    @Call('readFile')
    async readFile(filepath: string): Promise<string> {
        return await fs.readFile(path.normalize(filepath), 'utf-8');
    }

    @Call('writeFile')
    async writeFile(filepath: string, data: string): Promise<void> {
        await fs.writeFile(filepath, data, 'utf-8');
    }

    @Call('exists')
    async exists(path: string): Promise<boolean> {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    @Call('mkdir')
    async mkdir(dir: string): Promise<void> {
        await fs.mkdir(dir, { recursive: true });
    }

    @Call('remove')
    async remove(path: string): Promise<void> {
        await fs.rm(path, { recursive: true, force: true });
    }

    @Call('rename')
    async rename(oldpath: string, newpath: string): Promise<void> {
        await fs.rename(oldpath, newpath);
    }

    @Call('readDir')
    async readDir(dir: string, all = false): Promise<any[]> {
        return (await fetchDirectoryContents(dir, all)) || [];
    }

    @Call('resolvePath')
    resolvePath(...paths: string[]): string {
        return path.resolve(...paths);
    }

    @Call('joinPath')
    joinPath(...paths: string[]): string {
        return path.join(...paths);
    }

    @Call('relativePath')
    relativePath(from: string, to: string): string {
        return path.relative(from, to);
    }
}
