type Theme = 'light' | 'dark';
type DeviceType = 'destop' | 'mobile' | 'unknown';
type DataSource =
    // Database sources
    | 'mysql'
    | 'postgresql'
    | 'mongodb'
    // File sources
    | 'json'
    | 'xml'
    | 'sqlite'
    // Default
    | 'none';

// Optional: Define source categories
type DatabaseSource = Extract<DataSource, 'mysql' | 'postgresql' | 'mongodb'>;
type FileSource = Extract<DataSource, 'json' | 'xml' | 'sqlite'>;
type TableType =
    | 'users'
    | 'movies'
    | 'comments'
    // Default
    | 'none';

type PluginData = {
    name: string;
    dirPath: string;
    entryPath: string;
    metadata: Partial<{ name: string; description: string; version: string; author: string; icon: string }>;
};
type JSPlugin = PluginData & Partial<{ module: any }>;
type PythonPlugin = PluginData & Partial<{ code: string }>;
type FileSystemItem = 'folder' | 'file';
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Route = {
    method: RequestMethod;
    path: string;
    event: string;
};
type BooleanChar = 'true' | 'false';
