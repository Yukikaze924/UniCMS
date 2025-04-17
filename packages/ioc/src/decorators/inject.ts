import { services } from '../provider.js';

export function Inject<T extends object>(
    token: string
): (value: undefined, context: ClassFieldDecoratorContext) => void {
    return (_: undefined, __: ClassFieldDecoratorContext) => {
        return function (initialValue: T) {
            return services.get<T>(token) || initialValue;
        };
    };
}
