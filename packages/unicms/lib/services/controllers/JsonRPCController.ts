import { Request, Response } from '@unicms/types';
import { ZodError } from 'zod';
import { JsonRpcRequest, jsonRpcRequestSchema, rpcContainer } from '../../rpc';
import { RPCController } from '@/lib/contracts/services';

export class JsonRPCController extends RPCController {
    private _version: string = '2.0';

    private async run(req: Request, res: Response) {
        try {
            const rpcRequest = jsonRpcRequestSchema.parse(req.body) as JsonRpcRequest;

            const method = rpcContainer.get(rpcRequest.method);
            if (!method) {
                throw new Error('Method not found');
            }

            const result = await method(...rpcRequest.params);

            res.json({
                jsonrpc: this._version,
                result,
                id: rpcRequest.id,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(200).json({
                    jsonrpc: this._version,
                    error: {
                        code: -32602,
                        message: 'Invalid params',
                        data: error.issues,
                    },
                    id: req.body?.id || null,
                });
            } else if (error instanceof Error) {
                res.status(200).json({
                    jsonrpc: this._version,
                    error: {
                        code: error.message === 'Method not found' ? -32601 : -32603,
                        message: error.message,
                    },
                    id: req.body?.id || null,
                });
            } else {
                res.status(200).json({
                    jsonrpc: this._version,
                    error: { code: -32603, message: 'Internal error' },
                    id: req.body?.id || null,
                });
            }
        }
    }

    public override async use(req: Request, res: Response) {
        await this.run(req, res);
    }
}
