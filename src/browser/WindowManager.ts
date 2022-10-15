import { createDecorator } from '@/common/instantiation/createDecorator';
import puppeteer from 'puppeteer-core';
import { BrowserWindow } from '@/browser/Window';

export interface IWindowManager {
  mainWindow: BrowserWindow;
  createMainWindow: (page: puppeteer.Page) => void;
}

export const IWindowManager = createDecorator<IWindowManager>('windowManager');

export class WindowManager implements IWindowManager {
  mainWindow: BrowserWindow;
  private windows: BrowserWindow[] = [];

  createMainWindow(page: puppeteer.Page) {
    this.mainWindow = new BrowserWindow(this, page);
    this.windows.push(this.mainWindow);
  }

  createWindow() {}
}
