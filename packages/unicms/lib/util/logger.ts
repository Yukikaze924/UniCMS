import chalk from 'chalk';

export default class Logger {
    static colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        bgRed: '\x1b[41m',
        bgGreen: '\x1b[42m',
        bgYellow: '\x1b[43m',
        bgBlue: '\x1b[44m',
        bgMagenta: '\x1b[45m',
        bgCyan: '\x1b[46m',
        bgWhite: '\x1b[47m',
    };

    /**
     * Generic log method
     * @param {string} message - The message to output
     * @param {string} color - Text color
     * @param {string} bgColor - Background color
     * @param {boolean} bold - Whether to bold the text
     */
    static log(message, color = '', bgColor = '', bold = false) {
        const boldCode = bold ? this.colors.bright : '';
        console.log(`${bgColor}${color}${boldCode}${message}${this.colors.reset}`);
    }

    /**
     * Multiple logs in one line
     * @param logs - The array of log object
     */
    static oneline(...logs: { message: string; color?: string; bgColor?: string; bold?: boolean }[]) {
        let _: string = '';
        for (const log of logs) {
            // 使用解构赋值并提供默认值
            const {
                message,
                color = '', // 默认值为空字符串
                bgColor = '', // 默认值为空字符串
                bold = false, // 默认值为 false
            } = log;

            const boldCode = bold ? this.colors.bright : '';
            const line = `${bgColor}${color}${boldCode}${message}${this.colors.reset}`;
            _ += line;
        }
        console.log(_);
    }

    static clear() {
        console.clear();
    }

    /**
     * Output info message
     * @param {string} message - The message to output
     * @param {boolean} bold - Whether to bold the text
     */
    static info(message) {
        console.info(chalk.cyan.inverse(' INFO ') + ' ' + message);
    }

    /**
     * Output success message
     * @param {string} message - The message to output
     * @param {boolean} bold - Whether to bold the text
     */
    static success(message) {
        console.log(chalk.green.inverse(' SUCCESS ') + ' ' + message);
    }

    /**
     * Output warning message
     * @param {string} message - The message to output
     * @param {boolean} bold - Whether to bold the text
     */
    static warning(message) {
        console.warn(chalk.yellowBright.inverse(' WARN ') + ' ' + message);
    }

    /**
     * Output error message
     * @param {string} message - The message to output
     * @param {boolean} bold - Whether to bold the text
     */
    static error(message) {
        console.error(chalk.red.inverse(' ERROR ') + ' ' + message);
    }

    /**
     * Highlight a message
     * @param {string} message - The message to output
     * @param {boolean} bold - Whether to bold the text
     */
    static highlight(message, bold = false) {
        this.log(message, this.colors.cyan, '', bold);
    }

    /**
     * Output a section title with background color
     * @param {string} title - The title
     * @param {boolean} bold - Whether to bold the text
     */
    static section(title, bgColor = this.colors.bgYellow, bold = false) {
        this.log(`${title}`, this.colors.white, bgColor, bold);
    }

    /**
     * Output a default message
     * @param {string} message - The message to output
     * @param {boolean} bold - Whether to bold the text
     */
    static default(message, bold = false) {
        this.log(message, '', '', bold);
    }

    /**
     * Output a blank line
     */
    static blank() {
        console.log();
    }

    static space() {
        console.log();
        return { space: this.space };
    }
}
