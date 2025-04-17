import request from '../request';

export const appService = {
    stats: async () => {
        const res = await request.post('/api/rpc', {
            jsonrpc: '2.0',
            method: 'app.stats',
            params: [],
        });
        return res.result;
    },
};
