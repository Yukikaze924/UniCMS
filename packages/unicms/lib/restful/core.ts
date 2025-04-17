import { HttpMethod, Request, Response } from '@unicms/types';

type RouteController = {
    method: HttpMethod;
    path: string;
    use: (request: Request, response: Response) => void;
    context: new () => void;
};

class Container {
    private static instance: Container;
    private controllers: RouteController[] = [];

    private constructor() {}

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    register(controller: RouteController): void {
        this.controllers.push(controller);
    }

    getControllers(): RouteController[] {
        return this.controllers;
    }
}

export const container = Container.getInstance();
export type { RouteController };
