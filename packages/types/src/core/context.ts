import { EnvConfiguration, ServerConfiguration, UnicmsAppConfiguration } from '../configurations';

type BaseContext = {
    appConfigs: UnicmsAppConfiguration;
    server: ServerConfiguration;
    env: EnvConfiguration;
    dev: boolean;
};

export type { BaseContext };
