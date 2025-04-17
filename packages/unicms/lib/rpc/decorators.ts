import { rpcContainer } from '.';

const RPC_CALL_IDENT = '__rpc_call_ident__';

export function RPCService(namespace: string): (value: new () => any, context: ClassDecoratorContext) => void {
    return (value: new () => any, _: ClassDecoratorContext) => {
        const map = new Map<string, (...args: any[]) => any | Promise<any>>();
        const instance = new value();

        for (const propName of Object.getOwnPropertyNames(value.prototype)) {
            const func = value.prototype[propName];
            const call = func[RPC_CALL_IDENT];
            if (typeof func === 'function' && call) {
                map.set(call, func.bind(instance));
            }
        }

        rpcContainer.register(namespace, map);
    };
}

export function Call<T>(
    methodName: string
): (value: (...args: any[]) => T | Promise<T>, context: ClassMethodDecoratorContext) => void {
    return (method: (...args: any[]) => T | Promise<T>, _: ClassMethodDecoratorContext) => {
        (method as any)[RPC_CALL_IDENT] = methodName;
    };
}
