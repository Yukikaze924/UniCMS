import { Response } from '@unicms/types';

type APIResponse<T = unknown> = {
    status: 'success' | 'error';
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        total: number;
        page: number;
        limit: number;
        [key: string]: any;
    };
};

type ResponseResult = Promise<Response | void>;

export type { APIResponse, ResponseResult };
