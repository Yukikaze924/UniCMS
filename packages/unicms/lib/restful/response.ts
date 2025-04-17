import { APIResponse } from './types/response';

type SuccessParams<T> = {
    data: T;
    meta?: any;
};

type ErrorParams = {
    error: string;
    message?: string;
};

class RESTfulResponse {
    public static success<T = any>(params: SuccessParams<T>): APIResponse<T> {
        return {
            status: 'success',
            data: params.data,
            meta: params.meta,
        };
    }

    public static error(params: ErrorParams): APIResponse<unknown> {
        return {
            status: 'error',
            error: params.error,
            message: params.message || '',
        };
    }
}

export { RESTfulResponse };
export type { SuccessParams, ErrorParams };
