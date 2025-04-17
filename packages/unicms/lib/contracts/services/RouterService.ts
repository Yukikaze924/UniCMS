import type { CoreContext, RequestHandler } from '@unicms/types';

abstract class RouterService {
    protected router: any;
    protected routes: any[] = [];

    constructor(router: any) {
        this.router = router;
    }

    /**
     * Expose internal router
     * @internal INTERNAL USE ONLY - This is a dangerous
     * method to expose the internal router.
     */
    __unwrap__() {
        return this.router;
    }

    /**
     * Add a GET route
     * @param path The route path
     * @param handler The function to handle the request
     */
    public abstract get(path: string, handler: RequestHandler): void;

    /**
     * Add a POST route
     * @param path The route path
     * @param handler The function to handle the request
     */
    public abstract post(path: string, handler: RequestHandler): void;

    /**
     * Add a PUT route
     * @param path The route path
     * @param handler The function to handle the request
     */
    public abstract put(path: string, handler: RequestHandler): void;

    /**
     * Add a DELETE route
     * @param path The route path
     * @param handler The function to handle the request
     */
    public abstract delete(path: string, handler: RequestHandler): void;

    /**
     * Add a route
     * @param path The route path
     * @param handler The function to handle the request
     */
    public abstract respond(path: string, handler: RequestHandler): void;

    /**
     * Add a router
     * @param path The route path
     * @param router The function to handle the request
     */
    public abstract register(path: string, router: any): void;

    /**
     * Add a middleware
     * @param middleware The middleware function
     */
    public abstract use(middleware: RequestHandler): void;

    /**
     * Create a HTTP Context
     *
     * @param req The http request
     * @param res The http response
     */
    public abstract createContext(request: any, response: any): CoreContext;

    /**
     * Create a HTTP Handler
     *
     * @param handler A callback using UniCMS's http context
     */
    public abstract createRequestHandler(handler: RequestHandler): any;

    /**
     * Create a HTTP middleware
     *
     * @param handler A callback using UniCMS's http context
     */
    public abstract createMiddleware(handler: RequestHandler): any;

    /**
     * Resolve route path with params.
     *
     * convert UniCMS's directory-based route to certain platform route pattern.
     *
     * @example
     * UniCMS: '[param]', '[...params]'
     * -> Express: '/:param', '/*'
     * -> Koa: TODO
     * -> Fastify: TODO
     */
    public abstract resolveRouteWithParams(path: string): string;
}

export { RouterService };
