export type RpcMethod = (...args: any[]) => Promise<any>;

export const rpcContainer = {
    container: new Map<string, Map<string, (...args: any[]) => Promise<any>>>(),

    register(namespace: string, method: Map<string, RpcMethod>) {
        if (this.container.has(namespace)) {
            throw new Error(`RPC service ${namespace} already registered`);
        }
        this.container.set(namespace, method);
    },

    get(query: string): RpcMethod | undefined {
        const items = query.split('.').filter(Boolean);
        if (items.length === 2) return this.container.get(items[0])?.get(items[1]);
        else throw new Error('Method not found');
    },

    list() {
        return Array.from(this.container.entries());
    },
};

export type RpcContainer = typeof rpcContainer;
