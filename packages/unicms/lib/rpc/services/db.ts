import { StorageService } from '@/lib/contracts/services';
import { Inject } from '@unicms/ioc';
import { Call, RPCService } from '../decorators';

@RPCService('db')
export class DatabaseService {
    @Inject('storage')
    private readonly storage!: StorageService;

    @Call('create')
    async create(table: string, data: object) {
        return this.storage.create(table, data);
    }

    @Call('find')
    async find(table: string, conditions: object) {
        return this.storage.find(table, conditions);
    }

    @Call('update')
    async update(table: string, data: object, conditions: object) {
        return this.storage.update(table, data, conditions);
    }

    @Call('delete')
    async delete(table: string, conditions: object) {
        return this.storage.delete(table, conditions);
    }

    @Call('showColumnFrom')
    async showColumnFrom(table: string) {
        return this.storage.showColumnFrom(table);
    }

    @Call('showTables')
    async showTables() {
        return (await this.storage.showTables()).map((item) => {
            return Object.values(item).at(0);
        });
    }
}
