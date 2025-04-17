import { services } from '@unicms/ioc';
import fs from 'fs';
import chalk from 'chalk';
import { StorageService } from '@/lib/contracts/services';
import { collectionSchema } from '@/lib/validators/collection';

class CollectionService {
    private _collection: Collection;
    public readonly filepath: string;
    public readonly key: string;
    private readonly database: StorageService = services.get<StorageService>('storage');
    private collectionProxy: Collection;

    constructor(path: string) {
        const schemaRawString = fs.readFileSync(path, 'utf-8');
        if (!schemaRawString || typeof schemaRawString !== 'string') {
            throw new Error('invalid json format at ' + chalk.dim(path));
        }
        const schemaJson = JSON.parse(schemaRawString);
        if (!collectionSchema.safeParse(schemaJson).success) {
            throw new Error('invalid schema format at ' + chalk.dim(path));
        }
        this._collection = schemaJson;
        this.filepath = path;
        this.key = this.findPrimaryKey(schemaJson);
        this._collection = this.createDeepProxy(schemaJson); // 初始化为代理对象
        this.collectionProxy = this._collection;
    }

    get Collection() {
        return this.collectionProxy;
    }

    set Collection(collection: Collection) {
        this._collection = this.createDeepProxy(collection); // 替换为新的代理对象
        this.collectionProxy = this._collection;
        this.saveToFile();
    }

    private createDeepProxy<T extends object>(target: T): T {
        const self = this;
        return new Proxy(target, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === 'object' && value !== null) {
                    return self.createDeepProxy(value); // 递归代理嵌套对象和数组
                }
                return value;
            },
            set(target, prop, value, receiver) {
                const result = Reflect.set(target, prop, value, receiver);
                if (result) {
                    self.saveToFile(); // 触发保存
                }
                return result;
            },
            deleteProperty(target, prop) {
                const result = Reflect.deleteProperty(target, prop);
                if (result) {
                    self.saveToFile(); // 触发保存
                }
                return result;
            },
        });
    }

    private saveToFile() {
        fs.writeFileSync(this.filepath, JSON.stringify(this._collection, void 0, '\t'), 'utf-8');
    }

    public async initialize() {
        await this.database.initialize(this._collection.collectionName, this._collection.attributes);
        this.Collection.attributes = await this.database.checkSchemaConsistency(
            this._collection.collectionName,
            this._collection.attributes
        );
    }

    public async find(id: string) {
        return await this.database.find(this._collection.collectionName, { [this.key]: id });
    }

    public async findAll() {
        return await this.database.find(this._collection.collectionName, {});
    }

    public async create(data: object) {
        delete data[this.key];
        await this.database.create(this._collection.collectionName, data);
    }

    public async update(id: string, data: object) {
        await this.database.update(this._collection.collectionName, data, { [this.key]: id });
        return this.find(id);
    }

    public async delete(id: string) {
        await this.database.delete(this._collection.collectionName, { [this.key]: id });
    }

    public async createAttribute(attribute: DefaultAttribute) {
        this.Collection.attributes.push(attribute as Attribute);
        await this.database.addColumn(this.Collection.collectionName, attribute);
    }

    public async updateAttribute(attributeName: string, attribute: DefaultAttribute) {
        const index = this.Collection.attributes.findIndex((attr) => attr.name === attributeName);
        if (index !== -1) {
            this.Collection.attributes[index] = attribute;
        }
        await this.database.updateColumn(this.Collection.collectionName, attributeName, attribute);
    }

    public async removeAttribute(attributeName: string) {
        const newAttributes = this.Collection.attributes.filter((item) => item.name !== attributeName);
        this.Collection.attributes = newAttributes;
        await this.database.dropColumn(this.Collection.collectionName, attributeName);
    }

    private findPrimaryKey(collection: Collection): string {
        const primaryAttribute = collection.attributes.find((attr) => (attr as IntAttribute).primary ?? false);

        if (primaryAttribute) {
            return primaryAttribute.name;
        } else {
            throw new Error(
                `'${collection.collectionName}' is missing primary key attribute. ${chalk.dim(this.filepath)}`
            );
        }
    }
}

export { CollectionService };
