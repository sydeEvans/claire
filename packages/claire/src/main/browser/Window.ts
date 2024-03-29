import type { IWindowManager } from '@/main/browser/WindowManager';
import { Page } from 'puppeteer-core';
import { EventEmitter } from 'events';

export class BrowserWindow extends EventEmitter {
  constructor(private windowManager: IWindowManager, public page: Page) {
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
    await this.page.evaluate(
      (messageData) => {
        window.postMessage(messageData);
      },
      {
        name,
        data,
      },
    );
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
