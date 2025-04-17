import request from '@/app/api/request';
import { RPC_API_ROUTE } from '../shared/constants';

export async function callRpc<T>(method: string, params?: any[]): Promise<T> {
    const response = await request.post(RPC_API_ROUTE, {
        jsonrpc: '2.0',
        method,
        params: params || [],
    });

    if (response.error) {
        throw new Error(response.error.message || `RPC call ${method} failed`);
    }

    return response.result as T;
}
