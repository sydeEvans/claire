import type { IWindowManager } from '@/main/browser/WindowManager';
import puppeteer from 'puppeteer-core';
import { EventEmitter } from 'events';

export class BrowserWindow extends EventEmitter {
  constructor(private windowManager: IWindowManager, private page: puppeteer.Page) {
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
}
