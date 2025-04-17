import { Request, Response } from '@unicms/types';
import { RESTfulResponse } from '@/lib/restful';
import { ResponseResult } from '@/lib/restful/types/response';

export interface RESTfulControllerMethods {
    findAll?(request: Request, response: Response): void;
    find?(request: Request, response: Response): void;
    create?(request: Request, response: Response): void;
    update?(request: Request, response: Response): void;
    delete?(request: Request, response: Response): void;
}

export abstract class RESTfulController implements RESTfulControllerMethods {
    public async findAll(request: Request, response: Response): ResponseResult {
        response.status(501).json(
            RESTfulResponse.error({
                error: '',
            })
        );
    }

    public async find(request: Request, response: Response): ResponseResult {
        response.status(501).json(
            RESTfulResponse.error({
                error: '',
            })
        );
    }

    public async create(request: Request, response: Response): ResponseResult {
        response.status(501).json(
            RESTfulResponse.error({
                error: '',
            })
        );
    }

    public async update(request: Request, response: Response): ResponseResult {
        response.status(501).json(
            RESTfulResponse.error({
                error: '',
            })
        );
    }

    public async delete(request: Request, response: Response): ResponseResult {
        response.status(501).json(
            RESTfulResponse.error({
                error: '',
            })
        );
    }
}

export abstract class RPCController {
    abstract use(request: Request, response: Response): void;
}
