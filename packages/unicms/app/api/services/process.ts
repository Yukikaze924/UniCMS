import request from '../request';

const RPC_API_ROUTE = '/api/rpc';

export const processService = {
    env: async () => {
        const res = await request.post(RPC_API_ROUTE, {
            jsonrpc: '2.0',
            method: 'process.env',
            params: [],
        });
        return res.result;
    },
};
