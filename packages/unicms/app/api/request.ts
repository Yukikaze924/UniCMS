// /app/api/request.ts
const server = window.unicms.server;

const BASE_URL = `${server.protocol}://${server.host}:${server.port}` || '';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
    }
    return response.json();
};

const request = {
    get: async (url: string, options?: RequestInit) => {
        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'GET',
            ...options,
        });
        return handleResponse(response);
    },
    post: async (url: string, data?: any, options?: RequestInit) => {
        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: JSON.stringify(data),
            ...options,
        });
        return handleResponse(response);
    },
    put: async (url: string, data?: any, options?: RequestInit) => {
        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: JSON.stringify(data),
            ...options,
        });
        return handleResponse(response);
    },
    delete: async (url: string, options?: RequestInit) => {
        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'DELETE',
            ...options,
        });
        return handleResponse(response);
    },
};

export default request;
