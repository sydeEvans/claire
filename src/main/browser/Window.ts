import type { IWindowManager } from '@/main/browser/WindowManager';
import puppeteer from 'puppeteer-core';
import { EventEmitter } from 'events';

export class BrowserWindow extends EventEmitter {
  constructor(private windowManager: IWindowManager, public page: puppeteer.Page) {
    super();

    page.on('close', () => {
      this.emit('close');
    });
  }

  loadUrl(url: string) {
    return this.page.goto(url);
  }

  expoFunction(name: string, func: Function) {
    return this.page.exposeFunction(name, func);
  }

  async dispatchEvent(name: string, data: any) {
    console.log(name, data, '----');
    await this.page.evaluate(() => {
      const event = new CustomEvent(`claire_message${name}`, {});
      document.dispatchEvent(event);
    });
  }

  getDevtoolsUrl() {
    // @ts-ignore 获取私有的targetId
    const pageId = this.page.target()._targetId;
    const { DevToolsLocal } = require('puppeteer-extra-plugin-devtools/lib/RemoteDevTools');
    const devToolsLocal = new DevToolsLocal(this.page.browser().wsEndpoint());
    const inspector = `${devToolsLocal.url}/devtools/inspector.html?ws=${devToolsLocal.wsHost}:${devToolsLocal.wsPort}/devtools/page/${pageId}`;
    const devtool_app = `${devToolsLocal.url}/devtools/devtools_app.html?ws=${devToolsLocal.wsHost}:${devToolsLocal.wsPort}/devtools/page/${pageId}`;

    return {
      inspector,
      devtool_app,
    };
  }
}
