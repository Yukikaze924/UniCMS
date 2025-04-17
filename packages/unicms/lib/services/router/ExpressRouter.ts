import { RouterService } from '@/lib/contracts/services';
import type { CoreContext, RequestHandler, Request, Response } from '@unicms/types';
import type {
    Router,
    Request as ExpressRequest,
    Response as ExpressResponse,
    RequestHandler as ExpressRequestHandler,
    NextFunction as ExpressNextFunction,
} from 'express';

class ExpressRouter extends RouterService {
    declare protected router: Router;

    constructor(router: Router) {
        super(router);
    }

    public override get(path: string, handler: RequestHandler): void {
        this.router.get(path, this.createRequestHandler(handler));
    }

    public override post(path: string, handler: RequestHandler): void {
        this.router.post(path, this.createRequestHandler(handler));
    }

    public override put(path: string, handler: RequestHandler): void {
        this.router.put(path, this.createRequestHandler(handler));
    }

    public override delete(path: string, handler: RequestHandler): void {
        this.router.delete(path, this.createRequestHandler(handler));
    }

    public override respond(path: string, handler: RequestHandler): void {
        this.router.use(path, this.createRequestHandler(handler));
    }

    public override register(path: string, router: Router): void {
        this.router.use(path, router);
    }

    public override use(middleware: RequestHandler): void {
        this.router.use(this.createMiddleware(middleware));
    }

    public override createContext(req: ExpressRequest, res: ExpressResponse): CoreContext {
        return {
            request: {
                method: req.method,
                params: req.params,
                body: req.body,
                query: req.query,
                headers: req.headers,
                ip: req.ip,
            } as Request,
            response: {
                status: (code) => {
                    res.status(code);
                    return res;
                },
                json: (data) => res.json(data),
                send: (data) => res.send(data),
                sendFile: (path) => res.sendFile(path),
                setHeader(name, value) {
                    res.setHeader(name, value);
                },
                type(mimeType) {
                    res.type(mimeType);
                },
            } as unknown as Response,
        };
    }

    public override createRequestHandler(handler: RequestHandler): ExpressRequestHandler {
        return (req: ExpressRequest, res: ExpressResponse) => {
            const adapter = this.createContext(req, res);
            handler(adapter.request, adapter.response);
        };
    }

    public override createMiddleware(handler: RequestHandler): ExpressRequestHandler {
        return (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
            const adapter = this.createContext(req, res);
            handler(adapter.request, adapter.response, next);
        };
    }

    public override resolveRouteWithParams(path: string) {
        return path.replace(/\[\.\.\.[^\]]+\]/g, '*').replace(/\[(.*?)\]/g, ':\$1');
    }
}

export { ExpressRouter };
