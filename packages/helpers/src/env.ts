export function resolveEnvWithPrefix(
    data: Record<string, string> | NodeJS.ProcessEnv | any,
    prefix: string = 'UNICMS_'
) {
    return Object.keys(data)
        .filter((key) => key.startsWith(prefix))
        .reduce((obj, key) => {
            obj[key] = data[key];
            return obj;
        }, {});
}
