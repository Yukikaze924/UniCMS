import { callRpc } from '@/lib/util/rpc';

const collectionService = {
    find: (collectionName: string) => callRpc<Collection>('collection.find', [collectionName]),
    findAll: () => callRpc<Collection[]>('collection.findAll'),
    create: (data: Collection) => callRpc<void>('collection.create', [data]),
    update: (collectionName: string, data: Partial<Collection>) =>
        callRpc<void>('collection.update', [collectionName, data]),
    delete: (collectionName: string) => callRpc<void>('collection.delete', [collectionName]),
};

const attributeService = {
    create: (collectionName: string, data: any) => callRpc('attribute.create', [collectionName, data]),
    update: (collectionName: string, attributeName: string, data: any) =>
        callRpc('attribute.update', [collectionName, attributeName, data]),
    delete: (collectionName: string, attributeName: string) =>
        callRpc('attribute.delete', [collectionName, attributeName]),
};

export { collectionService, attributeService };
