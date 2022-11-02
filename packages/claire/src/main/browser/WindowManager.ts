import { createDecorator } from '@/common/instantiation/createDecorator';
import puppeteer from 'puppeteer-core';
import { BrowserWindow } from '@/main/browser/Window';

export interface IWindowOptions {
  width?: number;
  height?: number;
  userAgent?: string;
}

export interface IPendingWindow {
  url: string;
  options: IWindowOptions;
  callback: (win: BrowserWindow) => void;
}

export interface IWindowManager {
  mainWindow: BrowserWindow;
  createMainWindow: (page: puppeteer.Page) => Promise<void>;
  createWindow: (url: string, options: IWindowOptions) => Promise<BrowserWindow>;
  registerRpcDomain: (domain: string, rpcDomainInstance: any) => void;
  registerCustomRpcMethod: (method: string, func: Function) => void;
  dispatchEvent: (name: string, data: any) => void;
}

export const IWindowManager = createDecorator<IWindowManager>('windowManager');

export class WindowManager implements IWindowManager {
  mainWindow: BrowserWindow;
  private windows: BrowserWindow[] = [];
  private windowSeq = 0;
  private pendingWindows_ = new Map<number, IPendingWindow>();

  private rpcDomainMap: Map<string, any> = new Map();

  async createMainWindow(page: puppeteer.Page) {
    this.mainWindow = new BrowserWindow(this, page);
    page.browser().on('targetcreated', this.targetCreated_.bind(this));
    await this._bindBridge(page);
  }

  private async _bindBridge(page: puppeteer.Page) {
    await page.evaluateOnNewDocument(`
    window.claire = {
      call: (method, data, options) => {
        __callBridge(method, data)
          .then((res) => {
            if (options?.success) {
              options.success(res);
            }
          })
          .catch((e) => {
            if (options?.fail) {
              options.fail(e);
            }
          });
      },
      on: (name, callback) => {
        document.addEventListener('claire_message' + name, callback);
      }
    };`);

    await page.exposeFunction('__callBridge', async (bridge, data) => {
      if (bridge === 'rpc') {
        const { domain, method, params } = data;
        const rpcDomain = this.rpcDomainMap.get(domain);
        if (!rpcDomain) {
          throw new Error(`rpc domain ${domain} not found`);
        }

        return rpcDomain[method](...params);
      }
    });
  }

  dispatchEvent(name: string, data: any) {
    this.mainWindow.dispatchEvent(name, data);
  }

  registerRpcDomain(domain: string, rpcDomainInstance: any) {
    this.rpcDomainMap.set(domain, rpcDomainInstance);
  }

  private _CUSTOM_RPC_DOMAIN = 'Custom';

  registerCustomRpcMethod(method: string, func: Function) {
    let customDomain = this.rpcDomainMap.get(this._CUSTOM_RPC_DOMAIN);
    if (!customDomain) {
      customDomain = {};
    }
    customDomain[method] = func;
    this.rpcDomainMap.set(this._CUSTOM_RPC_DOMAIN, customDomain);
  }

  async createWindow(url: string, options: IWindowOptions): Promise<BrowserWindow> {
    const seq = ++this.windowSeq;
    // toolbar=no,scrollbars=no,location=no,resizable =yes
    const params = ['popup', 'toolbar=no', 'location=no', 'resizable=0'];

    await this.mainWindow.page.evaluate(
      `window.open('about:blank?seq=${seq}', '', '${params.join(',')}')`,
    );

    return new Promise((callback) => {
      this.pendingWindows_.set(seq, { url, options, callback });
    });
  }

  async targetCreated_(target: puppeteer.Target) {
    const newTargetPage = await target.page();
    if (!newTargetPage) {
      // no page target
      return;
    }

    const newTargetPageUrl = newTargetPage.url();
    if (newTargetPageUrl === 'chrome://new-tab-page/') {
      await newTargetPage.close();
      return;
    }

    const seq = newTargetPageUrl.startsWith('about:blank?seq=')
      ? newTargetPageUrl.substr('about:blank?seq='.length)
      : '';

    const params = this.pendingWindows_.get(Number(seq));
    if (!params) return;

    const { callback, options, url } = params;
    this.pendingWindows_.delete(Number(seq));

    if (options.width && options.height) {
      await newTargetPage.evaluate(`window.resizeTo(${options.width}, ${options.height})`);
    }

    if (options.userAgent) {
      await newTargetPage.setUserAgent(options.userAgent);
    }

    this._bindBridge(newTargetPage);
    const window = new BrowserWindow(this, newTargetPage);
    this.windows.push(window);

    if (callback) {
      callback(window);
    }

    await window.loadUrl(url);
  }
}
