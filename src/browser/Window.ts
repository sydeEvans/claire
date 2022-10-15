import type { IWindowManager } from '@/browser/WindowManager';
import puppeteer from 'puppeteer-core';

export class BrowserWindow {
  constructor(private windowManager: IWindowManager, private page: puppeteer.Page) {}

  loadUrl(url: string) {
    return this.page.goto(url);
  }
}
