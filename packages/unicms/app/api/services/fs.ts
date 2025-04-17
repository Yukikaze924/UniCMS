import { FileSystemService } from '@/lib/rpc/types';
import { callRpc } from '@/lib/util/rpc';

const fileSystemService: FileSystemService = {
    readFile: (filepath: string) => callRpc<string>('fs.readFile', [filepath]),
    writeFile: (filepath: string, data: any) => callRpc<void>('fs.writeFile', [filepath, data]),
    exists: (path: string) => callRpc<boolean>('fs.exists', [path]),
    mkdir: (dir: string) => callRpc<void>('fs.mkdir', [dir]),
    remove: (path: string) => callRpc<void>('fs.remove', [path]),
    rename: (oldPath: string, newPath: string) => callRpc<void>('fs.rename', [oldPath, newPath]),
    readDir: (dir: string) => callRpc<any[]>('fs.readDir', [dir]),
    resolvePath: (...paths: string[]) => callRpc<string>('fs.resolvePath', paths),
    joinPath: (...paths: string[]) => callRpc<string>('fs.joinPath', paths),
    relativePath: (...paths: string[]) => callRpc<string>('fs.relativePath', paths),
};

export { fileSystemService };
