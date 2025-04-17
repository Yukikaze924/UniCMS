import { StorageService } from '@/lib/contracts/services';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { RowDataPacket } from 'mysql2';

class MysqlStorage extends StorageService {
    declare protected database: MySql2Database;

    constructor(database: MySql2Database) {
        super(database);
        this.database = database;
    }

    private parseDataType(typeStr: string): { type: string; length?: number } {
        const regex = /^([a-zA-Z]+)(?:\((\d+)\))?/;
        const match = typeStr.match(regex);
        if (!match) {
            return { type: typeStr.toUpperCase() };
        }
        const [_, type, length] = match;
        return {
            type: type.toUpperCase(),
            length: length ? parseInt(length, 10) : undefined,
        };
    }

    private generateColumnDefinition(field: any): string {
        let definition = `${field.name} ${field.type.toUpperCase()}`;
        if (field.length) {
            definition += `(${field.length})`;
        }
        if (field.nullable === false) {
            definition += ' NOT NULL';
        }
        if (field.defaultValue !== undefined) {
            definition += ` DEFAULT ${field.defaultValue}`;
        }
        return definition;
    }

    public override async checkSchemaConsistency(name: string, fields: any[]): Promise<Attribute[]> {
        const [tables] = await this.database.execute(`SHOW TABLES LIKE '${name}'`);
        if (tables[0]?.length === 0) return fields;

        let result = (await this.database.execute(`SHOW COLUMNS FROM ${name}`)) as any;

        let existingFields = result[0].map((col) => ({
            name: col.Field,
            ...this.parseDataType(col.Type),
            nullable: col.Null === 'YES',
            defaultValue: col.Default,
        }));

        let fieldMap = new Map(fields.map((f) => [f.name, f]));
        let existingMap = new Map(existingFields.map((f) => [f.name, f]));

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            let existing = existingMap.get(field.name) as any;

            if (!existing) {
                let previousFieldName: string | null = null;
                for (let j = i - 1; j >= 0; j--) {
                    const prevField = fields[j];
                    if (existingMap.has(prevField.name)) {
                        previousFieldName = prevField.name;
                        break;
                    }
                }

                const columnDefinition = this.generateColumnDefinition(field);
                let alterSql = `ALTER TABLE ${name} ADD COLUMN ${columnDefinition}`;
                if (previousFieldName) {
                    alterSql += ` AFTER ${previousFieldName}`;
                } else {
                    alterSql += ' FIRST';
                }

                await this.database.execute(alterSql);

                if (field.primary) {
                    const addPkSql = `ALTER TABLE ${name} ADD PRIMARY KEY (${field.name})`;
                    await this.database.execute(addPkSql);
                }

                if (field.autoIncrement) {
                    const modifySql = `ALTER TABLE ${name} MODIFY COLUMN ${field.name} ${field.type.toUpperCase()}${field.length ? `(${field.length})` : ''} AUTO_INCREMENT`;
                    await this.database.execute(modifySql);
                }

                result = await this.database.execute<RowDataPacket[][]>(`SHOW COLUMNS FROM ${name}`);

                existingFields = result[0].map((col: any) => ({
                    name: col.Field,
                    ...this.parseDataType(col.Type),
                    nullable: col.Null === 'YES',
                    defaultValue: col.Default,
                }));
                existingMap = new Map(existingFields.map((f) => [f.name, f]));
                existing = existingMap.get(field.name);

                if (!existing) {
                    throw new Error(`Failed to add column ${field.name} to table ${name}.`);
                }
            }

            if (existing.type !== field.type.toUpperCase()) {
                throw new Error(`Column ${field.name} type mismatch: expected ${field.type}, found ${existing.type}.`);
            }

            if (field.length !== undefined && existing.length !== field.length) {
                throw new Error(
                    `Column ${field.name} length mismatch: expected ${field.length}, found ${existing.length}.`
                );
            }

            if (field.nullable === false && existing.nullable) {
                throw new Error(`Column ${field.name} should be NOT NULL.`);
            }

            // if (field.primary && !existing.primary) {
            //     throw new Error(`Column ${field.name} should be primary key.`);
            // }

            // if (field.autoIncrement && !existing.autoIncrement) {
            //     throw new Error(`Column ${field.name} should be auto increment.`);
            // }

            if (field.defaultValue !== undefined && existing.defaultValue !== field.defaultValue) {
                throw new Error(
                    `Column ${field.name} default value mismatch: expected ${field.defaultValue}, found ${existing.defaultValue}.`
                );
            }
        }

        // Check for unexpected columns
        let attributes = [...fields];
        for (const existing of existingFields) {
            if (!fieldMap.has(existing.name)) {
                attributes.push(existing);
            }
        }

        // Check primary keys
        // const existingPrimary = existingFields.filter((f) => f.primary).map((f) => f.name);
        // const expectedPrimary = fields.filter((f) => f.primary).map((f) => f.name);
        // if (existingPrimary.sort().join() !== expectedPrimary.sort().join()) {
        //     throw new Error(`Primary key mismatch in table ${name}.`);
        // }

        return attributes as Attribute[];
    }

    public override async initialize(name: string, fields: any[]): Promise<void> {
        const attributes = fields.map((field) => {
            let fieldDefinition = `${field.name} ${field.type.toUpperCase()}`;

            if (field.length) {
                fieldDefinition += `(${field.length})`;
            }

            if (field.primary) {
                fieldDefinition += ' PRIMARY KEY';
            }

            if (field.autoIncrement) {
                fieldDefinition += ' AUTO_INCREMENT';
            }

            if (field.nullable === false) {
                fieldDefinition += ' NOT NULL';
            }

            if (field.defaultValue) {
                fieldDefinition += ` DEFAULT ${field.defaultValue}`;
            }

            return fieldDefinition;
        });

        const createTableSQL = `CREATE TABLE IF NOT EXISTS ${name} (${attributes.join(', ')})`;

        await this.database.execute(createTableSQL);
    }

    public override async create<T extends object>(table: string, data: T): Promise<void> {
        const keys = Object.keys(data).join(', ');
        const values = Object.values(data)
            .map((value) => `'${value}'`)
            .join(', ');

        const insertSQL = `INSERT INTO ${table} (${keys}) VALUES (${values})`;
        await this.database.execute(insertSQL);
    }

    public override async find<T>(table: string, conditions: Partial<T>): Promise<T[]> {
        const whereClause = Object.entries(conditions)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(' AND ');

        const selectSQL = `SELECT * FROM ${table} ${whereClause ? `WHERE ${whereClause}` : ''}`;
        const result = await this.database.execute(selectSQL);

        return result[0] as unknown as T[];
    }

    public override async update<T>(table: string, data: Partial<T>, conditions: Partial<T>): Promise<void> {
        const setClause = Object.entries(data)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(', ');

        const whereClause = Object.entries(conditions)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(' AND ');

        const updateSQL = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        await this.database.execute(updateSQL);
    }

    public override async delete<T>(table: string, conditions: Partial<T>): Promise<void> {
        const whereClause = Object.entries(conditions)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(' AND ');

        const deleteSQL = `DELETE FROM ${table} ${whereClause ? `WHERE ${whereClause}` : ''}`;
        await this.database.execute(deleteSQL);
    }

    public override async addColumn(table: string, column: DefaultAttribute): Promise<void> {
        let columnDefinition = `${column.name} ${column.type.toUpperCase()}`;

        if (column.length) {
            columnDefinition += `(${column.length})`;
        }

        if (column.nullable === false) {
            columnDefinition += ' NOT NULL';
        }

        if (column.defaultValue !== undefined) {
            columnDefinition += ` DEFAULT ${column.defaultValue}`;
        }

        const alterTableSQL = `ALTER TABLE ${table} ADD COLUMN ${columnDefinition}`;
        await this.database.execute(alterTableSQL);
    }

    public override async showColumnFrom(table: string) {
        return (await this.database.execute(`SHOW COLUMNS FROM ${table}`)).at(0) as any[];
    }

    public override async updateColumn(table: string, columnName: string, column: DefaultAttribute): Promise<void> {
        // 构建类型部分，包括长度
        let typeStr = column.type.toUpperCase();
        if (column.length !== undefined) {
            typeStr += `(${column.length})`;
        }

        // 处理是否允许NULL
        const nullableStr = column.nullable ? 'NULL' : 'NOT NULL';

        // 处理默认值
        let defaultValueClause = '';
        if (column.defaultValue != undefined) {
            if (typeof column.defaultValue === 'string') {
                // 转义单引号并包裹在单引号中
                const escapedValue = column.defaultValue.replace(/'/g, "''");
                defaultValueClause = `DEFAULT '${escapedValue}'`;
            } else if (typeof column.defaultValue === 'boolean') {
                // 使用MySQL的TRUE/FALSE字面量
                defaultValueClause = `DEFAULT ${column.defaultValue ? 'TRUE' : 'FALSE'}`;
            } else {
                // 数字或其他类型直接使用
                defaultValueClause = `DEFAULT ${column.defaultValue}`;
            }
        }

        // 构建MODIFY COLUMN子句
        const modifyParts = [
            `CHANGE COLUMN ${columnName} ${column.name} ${typeStr}`,
            nullableStr,
            defaultValueClause,
        ].filter((part) => part !== ''); // 过滤空字符串部分

        const modifyClause = modifyParts.join(' ');

        // 构建并执行ALTER TABLE语句
        const alterSQL = `ALTER TABLE ${table} ${modifyClause}`;
        await this.database.execute(alterSQL);
    }

    public override async dropColumn(table: string, column: string) {
        await this.database.execute(`ALTER TABLE ${table} DROP COLUMN ${column}`);
    }

    public override async showTables() {
        return (await this.database.execute(`SHOW TABLES`)).at(0) as unknown[] as { [key: string]: string }[];
    }

    public override async dropTable(table: string) {
        await this.database.execute(`DROP TABLE IF EXISTS ${table}`);
    }
}

export { MysqlStorage };
