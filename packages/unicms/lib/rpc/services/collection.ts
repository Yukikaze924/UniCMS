import { Inject } from '@unicms/ioc';
import { Call, RPCService } from '../decorators';
import { RESTfulRouteService } from '@/lib/services/core';
import { RESTfulRoute } from '@/lib/services/routes';
import { CollectionService as CollectionHandler } from '@/lib/services/storage';
import path from 'node:path';
import fs from 'fs/promises';
import { collectionSchema } from '@/lib/validators/collection';
import { SCHEMA_FILE_NAME } from '@/lib/shared/constants';

@RPCService('collection')
export class CollectionService {
    @Inject('routeService')
    private readonly routeService!: RESTfulRouteService;

    @Call('findAll')
    public async findAll() {
        return this.routeService.findAllRoutes().map((item) => item.Service.Collection);
    }

    @Call('find')
    public async find(collectionName: string) {
        return this.routeService.findRoute(collectionName)?.Service.Collection;
    }

    @Call('create')
    public async create(data: Collection) {
        const schema: Collection = data;
        const validation = this.validateSchema(schema);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        if (this.routeService.findRouteIndex(schema.collectionName) !== -1) {
            throw new Error('Collection already exists');
        }

        try {
            const schemaFilePath = await this.saveCollectionSchema(schema.collectionName, schema);
            const route = new RESTfulRoute(new CollectionHandler(schemaFilePath));
            await route.init();

            this.routeService.createRouteHandler(`/${schema.collectionName}/:id?`, route);
            this.routeService.addRoute(route);
        } catch (error: any) {
            throw new Error(error.message);
        }

        return;
    }

    @Call('update')
    public async update(collectionName: string, data: Partial<Collection>) {
        const index = this.routeService.findRouteIndex(collectionName);
        if (index === -1) {
            throw new Error('Collection not found');
        }

        const collection = {
            ...this.routeService.findRouteByIndex(index).Service.Collection,
            ...data,
        };

        const validation = this.validateSchema(collection);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        this.routeService.findRouteByIndex(index).Service.Collection = collection;

        return;
    }

    @Call('delete')
    public async delete(collectionName: string) {
        const index = this.routeService.findRouteIndex(collectionName);
        if (index === -1) {
            throw new Error('Collection not found');
        }

        try {
            const collectionName = this.routeService.findRouteByIndex(index).Service.Collection.collectionName;
            const schemaDir = path.resolve(this.routeService.getApiDir(), collectionName);

            this.routeService.removeRouteByIndex(index);
            await fs.rm(schemaDir, { recursive: true, force: true });
        } catch (error: any) {
            throw new Error(error.message);
        }

        return;
    }

    private validateSchema(schema: any): { valid: boolean; error?: any; message?: string } {
        const result = collectionSchema.safeParse(schema);
        if (!result.success) {
            return { valid: false, error: result.error, message: 'Invalid collection schema' };
        }
        return { valid: true };
    }

    private async saveCollectionSchema(collectionName: string, schema: Collection) {
        const schemaDir = path.resolve(this.routeService.getApiDir(), collectionName);
        await fs.mkdir(schemaDir, { recursive: true });

        const schemaFilePath = path.join(schemaDir, SCHEMA_FILE_NAME);
        await fs.writeFile(schemaFilePath, JSON.stringify(schema, null, '\t'), 'utf-8');

        return schemaFilePath;
    }
}

@RPCService('attribute')
export class AttributeService {
    @Inject('routeService')
    private readonly routeService!: RESTfulRouteService;

    @Call('create')
    public async create(collectionName: string, data: any) {
        const index = this.routeService.findRouteIndex(collectionName);
        if (index === -1) {
            throw new Error('Collection not found');
        }

        try {
            await this.routeService.findRouteByIndex(index).Service.createAttribute(data);
        } catch (error: any) {
            throw new Error(error.message);
        }

        return;
    }

    @Call('update')
    public async update(collectionName: string, attributeName: string, data: any) {
        const index = this.routeService.findRouteIndex(collectionName);
        if (index === -1) {
            throw new Error('Collection not found');
        }

        try {
            await this.routeService.findRouteByIndex(index).Service.updateAttribute(attributeName, data);
        } catch (error: any) {
            throw new Error(error.message);
        }

        return;
    }

    @Call('delete')
    public async delete(collectionName: string, attributeName: string) {
        const index = this.routeService.findRouteIndex(collectionName);
        if (index === -1) {
            throw new Error('Collection already exists');
        }

        try {
            await this.routeService.findRouteByIndex(index).Service.removeAttribute(attributeName);
        } catch (error: any) {
            throw new Error(error.message);
        }

        return;
    }
}
