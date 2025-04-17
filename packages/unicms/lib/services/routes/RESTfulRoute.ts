import type { CoreContext, Response } from '@unicms/types';
import { CollectionService } from '../storage';
import { RESTfulResponse } from '@/lib/restful';

export class RESTfulRoute {
    private collectionService: CollectionService;

    constructor(collection: CollectionService) {
        this.collectionService = collection;
    }

    get Service() {
        return this.collectionService;
    }

    public async handle(ctx: CoreContext) {
        if (this.collectionService.Collection.options?.private) {
            return;
        }

        const { method, params, body } = ctx.request;
        const res = ctx.response;

        switch (method) {
            case 'GET':
                return this.read(params.id, res);
            case 'POST':
                return this.create(body, res);
            case 'PUT':
                return this.update(params.id, body, res);
            case 'DELETE':
                return this.delete(params.id, res);
            default:
                res.status(405).send('Method Not Allowed');
        }
    }

    public async read(id: string, res: Response) {
        if (id) {
            const result = await this.collectionService.find(id);
            return res.json(RESTfulResponse.success({ data: result[0] }));
        }
        const result = await this.collectionService.findAll();
        return res.json(RESTfulResponse.success({ data: result }));
    }

    public async create(data: object, res: Response) {
        const result = await this.collectionService.create(data);
        return res.status(201).json(RESTfulResponse.success({ data: result }));
    }

    public async update(id: string, data: object, res: Response) {
        const result = await this.collectionService.update(id, data);
        return res.json(RESTfulResponse.success({ data: result }));
    }

    public async delete(id: string, res: Response) {
        await this.collectionService.delete(id);
        return res.status(204).send(RESTfulResponse.success({ data: null }));
    }

    public async init() {
        await this.collectionService.initialize();
    }
}
