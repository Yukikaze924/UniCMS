import { container, RouteController } from '../core';

const CTRLR_PROP_NAME = '__controller__';

function normalizePath(...parts: (string | undefined)[]): string {
    const pathSegments = parts
        .filter(Boolean)
        .flatMap((part) => (part as string).split(/[/\\]+/))
        .filter(Boolean);

    return '/' + pathSegments.join('/');
}

export function Controller(token?: string) {
    return (value: any, context: ClassDecoratorContext) => {
        if (context.kind !== 'class') {
            throw new Error('@Controller can only decorate classes');
        }

        for (const propName of Object.getOwnPropertyNames(value.prototype)) {
            const methodFunc = value.prototype[propName];
            const controller: RouteController = methodFunc[CTRLR_PROP_NAME];

            if (typeof methodFunc === 'function' && controller) {
                const pathSegs = token ? [token, controller.path] : [controller.path];
                const path = normalizePath(...pathSegs);

                controller.path = path;
                controller.context = new value();
                container.register(controller);
            }
        }

        return value;
    };
}

export function Get(path?: string) {
    return (value: any, _: ClassMethodDecoratorContext) => {
        Reflect.set(value, CTRLR_PROP_NAME, {
            method: 'GET',
            path: path,
            use: value,
        } as RouteController);
    };
}

export function Post(path?: string) {
    return (value: any, _: ClassMethodDecoratorContext) => {
        Reflect.set(value, CTRLR_PROP_NAME, {
            method: 'POST',
            path: path,
            use: value,
        } as RouteController);
    };
}

export function Put(path?: string) {
    return (value: any, _: ClassMethodDecoratorContext) => {
        Reflect.set(value, CTRLR_PROP_NAME, {
            method: 'PUT',
            path: path,
            use: value,
        } as RouteController);
    };
}

export function Delete(path?: string) {
    return (value: any, _: ClassMethodDecoratorContext) => {
        Reflect.set(value, CTRLR_PROP_NAME, {
            method: 'DELETE',
            path: path,
            use: value,
        } as RouteController);
    };
}
