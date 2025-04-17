type FileSystemService = {
    readFile: (filepath) => Promise<string>;
    writeFile: (filepath, data) => Promise<void>;
    exists: (path) => Promise<boolean>;
    mkdir: (dir) => Promise<void>;
    remove: (path) => Promise<void>;
    rename: (oldPath, newPath) => Promise<void>;
    readDir: (dir) => Promise<any[]>;
    resolvePath: (...paths: string[]) => Promise<string>;
    joinPath: (...paths: string[]) => Promise<string>;
    relativePath: (from: string, to: string) => Promise<string>;
};

export type { FileSystemService };
