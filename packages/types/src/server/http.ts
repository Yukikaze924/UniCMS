/**
 * Supported HTTP methods conforming to RFC specifications
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Typed HTTP request object with path parameters, body, and query parameters
 * @template Params - Type definition for path parameters (default: empty object)
 * @template Body - Type definition for request body (default: unknown)
 * @template Query - Type definition for query parameters (default: string or array values)
 */
interface Request<
    Params extends Record<string, string> = Record<string, string>,
    Body = any,
    Query extends Record<string, string | string[]> = Record<string, string | string[]>,
> {
    /** HTTP method verb in uppercase */
    method: HttpMethod;

    /** Parsed route parameters from URL path */
    params: Params;

    /** Request body payload (parsed based on content-type) */
    body: Body;

    /** Parsed query parameters from URL */
    query: Query;

    /**
     * HTTP request headers (case-insensitive keys)
     * @example { 'content-type': 'application/json' }
     */
    headers?: Record<string, string | string[]>;

    ip: string;

    [key: string]: any;
}

/**
 * HTTP response object with chainable methods
 */
interface Response {
    /**
     * Sets HTTP status code
     * @param code - Standard HTTP status code
     * @returns Self for method chaining
     */
    status(code: number): this;

    /**
     * Sends JSON response with proper headers
     * @typeParam T - Response body type
     * @param data - JSON-serializable object
     * @returns Self for method chaining
     */
    json<T = unknown>(data: T): this;

    /**
     * Sends response with automatic content-type detection
     * @typeParam T - Response body type (string | object | Buffer)
     * @param data - Response payload
     * @returns Self for method chaining
     */
    send<T = unknown>(data?: T): this;

    /**
     * Sends a file as response
     * @param path - Absolute path to file
     * @param options - Optional file transfer options
     * @returns Self for method chaining
     */
    sendFile(path: string, options?: Record<string, unknown>): this;

    /**
     * Sets HTTP response header
     * @param name - Header name (case-insensitive)
     * @param value - Header value
     * @returns Self for method chaining
     */
    setHeader(name: string, value: string): this;

    /**
     * Sets Content-Type header via MIME type
     * @param mimeType - Standard MIME type identifier
     * @returns Self for method chaining
     */
    type(mimeType: string): this;
}

type HttpMiddlewareNext = (error?: unknown) => void;

/**
 * HTTP adapter context
 * @template Request - Custom request type extension
 * @template Response - Custom response type extension
 */
interface CoreContext {
    /** HTTP request object */
    request: Request;
    /** HTTP response object */
    response: Response;
}

/**
 * Request handler function type with full type safety
 * @typeParam Params - Path parameters type
 * @typeParam Body - Request body type
 * @typeParam Query - Query parameters type
 * @typeParam ResponseBody - Expected response payload type
 */
type RequestHandler<
    Params extends Record<string, string> = Record<string, string>,
    Body = unknown,
    Query extends Record<string, string | string[]> = Record<string, string | string[]>,
    ResponseBody = unknown,
> = (
    request: Request<Params, Body, Query>,
    response: Response,
    next?: HttpMiddlewareNext
) => Promise<ResponseBody> | ResponseBody;

/**
 * Extended error object for HTTP error handling
 */
interface HttpError extends Error {
    /** HTTP status code associated with error */
    statusCode?: number;
    /**
     * Flag indicating if error message should be exposed to client
     * @default false
     */
    expose?: boolean;
    /** Custom headers to send with error response */
    headers?: Record<string, string>;
}

export type { HttpMethod, Request, Response, HttpMiddlewareNext, CoreContext, RequestHandler, HttpError };
