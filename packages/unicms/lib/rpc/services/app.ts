import { Inject } from '@unicms/ioc';
import { Call, RPCService } from '../decorators';
import { StatisticService } from '@/lib/services/storage';

@RPCService('app')
export class ApplicationService {
    @Inject('stats')
    private readonly stats!: StatisticService;

    @Call('stats')
    getStats() {
        return this.stats.getStatistics();
    }
}
