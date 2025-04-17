import { RouterService } from '@/lib/contracts/services';
import { RESTfulRoute } from '../routes';
import { convertToUnixPath } from '@unicms/helpers/fs';
import path from 'node:path';
import { getExtension } from '@unicms/helpers/string';
import { pathToFileURL } from 'node:url';
import { CollectionService } from '../storage';
import { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { Inject } from '@unicms/ioc';
import { StatisticService } from '../storage';
import { tsImport } from 'tsx/esm/api';
import { ROUTE_FILE_PATTERN, SCHEMA_FILE_NAME } from '@/lib/shared/constants';

export class RESTfulRouteService {
    private readonly router: RouterService;
    private readonly routes: RESTfulRoute[];
    private readonly apiDir: string;

    @Inject('stats')
    private readonly stats!: StatisticService;

    constructor(router: RouterService, dir: string) {
        this.router = router;
        this.routes = [];
        this.apiDir = dir;
    }

    public getApiDir() {
        return this.apiDir;
    }

    public addRoute(route: RESTfulRoute) {
        this.routes.push(route);
    }

    public findRoute(name: string) {
        return this.routes.find((route) => route.Service.Collection.collectionName === name);
    }

    public findRouteByIndex(index: number) {
        return this.routes[index];
    }

    public findAllRoutes(): ReadonlyArray<RESTfulRoute> {
        return this.routes as ReadonlyArray<RESTfulRoute>;
        // return [...this.routes];
    }

    public findRouteIndex(name: string) {
        return this.routes.findIndex((route) => route.Service.Collection.collectionName === name);
    }

    public removeRoute(name: string) {
        const index = this.findRouteIndex(name);
        if (index !== -1) {
            this.routes.splice(index, 1);
        }
    }

    public removeRouteByIndex(index: number) {
        this.routes.splice(index, 1);
    }

    public createRouteHandler(path: string, route: RESTfulRoute) {
        this.router.respond(path, (req, res) => {
            route.handle({
                request: req,
                response: res,
            });
            this.stats.recordVisit(req.ip, Reflect.get(req.headers as object, 'user-agent'));
        });
    }

    public async createFileBasedRoutes(dir: string) {
        await this.createSchemaFileRoutes(dir);
        await this.createRouteFileRoutes(dir);
    }

    private async createSchemaFileRoutes(basePath: string): Promise<void> {
        await this.scanDirectory(
            basePath,
            basePath,
            (entry) => this.isSchemaFile(entry),
            (dirPath, filePath, basePath) => this.processSchemaFile(dirPath, filePath, basePath)
        );
    }

    private async createRouteFileRoutes(basePath: string): Promise<void> {
        await this.scanDirectory(
            basePath,
            basePath,
            (entry) => this.isRouteFile(entry),
            (dirPath, filePath, basePath) => this.processRouteFile(dirPath, filePath, basePath)
        );
    }

    private async processSchemaFile(dirPath: string, fullPath: string, basePath: string): Promise<void> {
        const relative = convertToUnixPath(path.relative(basePath, dirPath));
        const prefix = relative ? `/${relative}` : '';

        const route = new RESTfulRoute(new CollectionService(fullPath));
        await route.init();

        this.createRouteHandler(`${prefix}/:id?`, route);
        this.addRoute(route);
    }

    private async processRouteFile(dirPath: string, fullPath: string, basePath: string) {
        const relative = convertToUnixPath(path.relative(basePath, dirPath));
        const route = this.router.resolveRouteWithParams(relative ? `/${relative}` : '');
        const ext = getExtension(fullPath);

        const MODULE =
            ext === 'ts'
                ? await tsImport(pathToFileURL(fullPath).href, import.meta.url)
                : ext === 'mjs'
                  ? await import(pathToFileURL(fullPath).href)
                  : null;

        if (MODULE === null) {
            throw new Error("Unknown file format: '" + ext + "'");
        }

        MODULE.GET && this.router.get(route, MODULE.GET);
        MODULE.POST && this.router.post(route, MODULE.POST);
        MODULE.PUT && this.router.put(route, MODULE.PUT);
        MODULE.DELETE && this.router.delete(route, MODULE.DELETE);
    }

    private isSchemaFile(dirent: Dirent): boolean {
        return dirent.isFile() && dirent.name === SCHEMA_FILE_NAME;
    }

    private isRouteFile(dirent: Dirent) {
        return dirent.isFile() && ROUTE_FILE_PATTERN.test(dirent.name);
    }

    private async scanDirectory(
        dirPath: string,
        basePath: string,
        fileFilter: (entry: Dirent) => boolean,
        processFile: (dirPath: string, filePath: string, basePath: string) => Promise<void>
    ) {
        await this.traverseDirectory(dirPath, async (entry, currentDirPath) => {
            const fullPath = path.join(currentDirPath, entry.name);
            if (entry.isDirectory()) {
                await this.scanDirectory(fullPath, basePath, fileFilter, processFile);
            } else if (fileFilter(entry)) {
                await processFile(currentDirPath, fullPath, basePath);
            }
        });
    }

    private async traverseDirectory(dirPath: string, processEntry: (entry: Dirent, dirPath: string) => Promise<void>) {
        const entries = await readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            await processEntry(entry, dirPath);
        }
    }
}
