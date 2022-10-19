import { createDecorator } from '@/common/instantiation/createDecorator';
import puppeteer from 'puppeteer-core';
import { BrowserWindow } from '@/main/browser/Window';

export interface IWindowOptions {
  width?: number;
  height?: number;
}

export interface IWindowManager {
  mainWindow: BrowserWindow;
  createMainWindow: (page: puppeteer.Page) => void;
  createWindow: (url: string, options: IWindowOptions) => Promise<BrowserWindow>;
}

export const IWindowManager = createDecorator<IWindowManager>('windowManager');

export class WindowManager implements IWindowManager {
  mainWindow: BrowserWindow;
  private windows: BrowserWindow[] = [];
  private windowSeq = 0;
  private pendingWindows_ = new Map<number, any>();

  createMainWindow(page: puppeteer.Page) {
    this.mainWindow = new BrowserWindow(this, page);
    page.browser().on('targetcreated', this.targetCreated_.bind(this));
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

    const window = new BrowserWindow(this, newTargetPage);
    this.windows.push(window);

    if (callback) {
      callback(window);
    }

    await window.loadUrl(url);
  }
}
