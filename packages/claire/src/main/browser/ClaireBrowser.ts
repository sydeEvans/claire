import { findChrome } from '@/common/utils/findChrome';
import { createDecorator } from '@/common/instantiation/createDecorator';
import { IWindowManager } from '@/main/browser/WindowManager';
import { addExtra } from 'puppeteer-extra';
import puppeteer_extra_plugin_devtools from 'puppeteer-extra-plugin-devtools';
import puppeteer, { Browser, CDPSession } from 'puppeteer-core';

const devtools = puppeteer_extra_plugin_devtools();

export interface IBrowserOptions {
    title: string;
    bgcolor?: string;
    icon?: string;

    args?: string[];

    height?: number;
    width?: number;
    left?: number;
    top?: number;
}

export interface IBrowser {
    launch: (opt: IBrowserOptions) => Promise<Browser>;
    loadUrl: (url: string) => Promise<void>;
    expoFunction: (name: string, func: Function) => Promise<void>;

    onExit: (cb: () => void) => void;
}

export const IBrowser = createDecorator<IBrowser>('puppeteer.Browser');

export class ClaireBrowser implements IBrowser {
    browser: Browser;
    cdpSession: CDPSession;
    options: IBrowserOptions;

    constructor(@IWindowManager private readonly windowManager: IWindowManager) {
    }

    private async initMainWindow() {
        const defaultBrowserContext = this.browser.defaultBrowserContext();
        await defaultBrowserContext.overridePermissions('https://domain', [
            'geolocation',
            'midi',
            'notifications',
            'camera',
            'microphone',
            'clipboard-read',
            'clipboard-write',
        ]);
        const pages = await this.browser.pages();
        const seqPage = pages[0];
        await this.windowManager.createMainWindow(seqPage);
    }

    private async setDockIcon() {
        await this.cdpSession.send('Browser.setDockTile', { image: this.options.icon });
    }

    expoFunction(name: string, func: Function) {
        return this.windowManager.mainWindow.expoFunction(name, func);
    }

    onExit(callback) {
        this.windowManager.mainWindow.on('close', callback);
    }

    async loadUrl(url: string) {
        await this.windowManager.mainWindow.loadUrl(url);
    }

    async launch(opt: IBrowserOptions) {
        this.setOptions(opt);
        const { options } = this;
        const executablePath = findChrome();

        if (!executablePath) {
            console.error(
                'Could not find Chrome installation, please make sure Chrome browser is installed from https://www.google.com/chrome/.',
            );
            process.exit(0);
        }

        const targetPage = `
    <title>${encodeURIComponent(options.title || '')}</title>
    <style>html{background:${encodeURIComponent(options.bgcolor as string)};}</style>
    `;

        const args = [
            '--test-type',
            `--app=data:text/html,${targetPage}`,
            '--enable-features=NetworkService,NetworkServiceInProcess',
        ];

        if (options.args) args.push(...options.args);
        if (typeof options.width === 'number' && typeof options.height === 'number') {
            args.push(`--window-size=${options.width},${options.height}`);
        }
        if (typeof options.left === 'number' && typeof options.top === 'number') {
            args.push(`--window-position=${options.left},${options.top}`);
        }

        let browser: Browser;

        try {
            const extraPp = addExtra(puppeteer);

            // use puppeteer-extra plugin
            extraPp.use(devtools);

            browser = await extraPp.launch({
                executablePath,
                devtools: false,
                // pipe: true,
                defaultViewport: null,
                headless: false,
                ignoreDefaultArgs: ['--enable-automation'],
                args,
            });
            this.browser = browser;
            this.cdpSession = await browser.target().createCDPSession();
            await this.setDockIcon();
            await this.initMainWindow();
        } catch (e: any) {
            if (e.toString().includes('Target closed')) {
                throw new Error(
                    'Could not start the browser or the browser was already running with the given profile.',
                );
            } else {
                throw e;
            }
        }
        return browser;
    }

    private setOptions(options) {
        const defaultRect = {
            bgcolor: '#ffffff',
            height: 768,
            width: 1280,
            left: 200,
            top: 200,
        };

        this.options = {
            ...defaultRect,
            ...options,
        };
    }
}
