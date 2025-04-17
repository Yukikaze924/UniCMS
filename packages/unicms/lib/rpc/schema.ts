import { z } from 'zod';

const jsonRpcRequestSchema = z.object({
    jsonrpc: z.literal('2.0'),
    method: z.string(),
    params: z.array(z.any()).default([]),
    id: z.union([z.string(), z.number(), z.null()]).optional(),
});

type JsonRpcRequest = z.infer<typeof jsonRpcRequestSchema>;

export { jsonRpcRequestSchema };
export type { JsonRpcRequest };
