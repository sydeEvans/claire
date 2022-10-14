import { createDecorator } from '@/common/instantiation/createDecorator';
import puppeteer from 'puppeteer-core';
import { BrowserWindow } from '@/browser/Window';

export interface IWindowManager {
  createMainWindow: (page: puppeteer.Page) => void;
}

export const IWindowManager = createDecorator<IWindowManager>('windowManager');

export class WindowManager implements IWindowManager {
  private windows: BrowserWindow[] = [];
  private mainWindow: BrowserWindow;

  createMainWindow(page: puppeteer.Page) {
    this.mainWindow = new BrowserWindow(this, page);
    this.windows.push(this.mainWindow);
  }

  createWindow() {}
}
