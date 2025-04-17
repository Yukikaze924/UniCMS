import { confirm, input } from '@inquirer/prompts';

export default async function init() {
    const packageName = await input({ message: 'What is your project named?' });
    const useTypescript = await confirm({ message: 'Would you like to use TypeScript?', default: false });
    const hasUnicmsConfig = await confirm({ message: 'Whould you like to customize configurations?', default: true });
}
