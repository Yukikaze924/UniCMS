import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';

export function createDatabaseConnection(url: string) {
    const poolConnection = createPool(url);
    return drizzle(poolConnection);
}
