import { Inject } from '@unicms/ioc';
import { Call, RPCService } from '../decorators';

@RPCService('process')
export class ProcessService {
    @Inject('env')
    private readonly env;

    @Call('env')
    getEnv() {
        return this.env;
    }
}
