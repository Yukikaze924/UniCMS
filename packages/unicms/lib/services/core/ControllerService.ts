import { RouterService } from '@/lib/contracts/services';
import { JsonRPCController } from '../controllers';
import { container } from '@/lib/restful';

export class ControllerService {
    protected readonly router: RouterService;

    constructor(router: RouterService) {
        this.router = router;
    }

    private get Router() {
        return this.router.__unwrap__();
    }

    public serve() {
        return this.Router;
    }

    public async registerRESTfulRoutes() {
        // @ts-ignore
        await import('../../restful/services');
        const controllers = container.getControllers();
        for (const controller of controllers) {
            const method = controller.method.toLowerCase();
            this.router[method](controller.path, controller.use.bind(controller.context));
        }
    }

    public async registerRPCRoutes() {
        // @ts-ignore
        await import('../../rpc/services');
        const controller = new JsonRPCController();
        this.router.post('/rpc', controller.use.bind(controller));
    }
}
