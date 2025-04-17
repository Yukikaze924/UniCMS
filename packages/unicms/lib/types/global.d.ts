import { BaseContext } from '@unicms/types';

declare global {
    interface Window {
        unicms: BaseContext;
    }
}

export {};
