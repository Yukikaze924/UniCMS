import { callRpc } from '@/lib/util/rpc';

const databaseService = {
    create: (table: string, data: object) => callRpc<void>('db.create', [table, data]),
    find: (table: string, conditions: object) => callRpc<any>('db.find', [table, conditions]),
    update: (table: string, data: object, conditions: object) => callRpc<void>('db.update', [table, data, conditions]),
    delete: (table: string, conditions: object) => callRpc<void>('db.delete', [table, conditions]),
    showColumnFrom: (table: string) => callRpc<any[]>('db.showColumnFrom', [table]),
    showTables: () => callRpc<string[]>('db.showTables'),
};

export { databaseService };
