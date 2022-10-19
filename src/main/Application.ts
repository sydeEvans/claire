import type { IBrowserOptions } from '@/main/browser/Browser';
import { InstantiationService, ServiceCollection } from '@/common/instantiation';
import { ServicesAccessor } from '@/common/instantiation/instantiationService';
import { Browser, IBrowser } from '@/main/browser/Browser';
import { ISimpleHttpServer, SimpleHttpServer } from '@/main/SimpleHttpServer';
import { EventEmitter } from 'events';
import { IWindowManager, IWindowOptions, WindowManager } from '@/main/browser/WindowManager';

interface IApplicationOptions {
  browserOptions: IBrowserOptions;
  serverFolder?: string;
  serverOrigin?: string;
}

export class Application extends EventEmitter {
  private accessor: ServicesAccessor;
  private opts: IApplicationOptions;

  constructor() {
    super();
    this.createService();
  }

  createService() {
    const services = new ServiceCollection();

    // register service
    services.set(ISimpleHttpServer, SimpleHttpServer);
    services.set(IBrowser, Browser);
    services.set(IWindowManager, WindowManager);

    const instantiationService = new InstantiationService(services);
    this.accessor = instantiationService.getAccessor();
  }

  get browserWindow() {
    return this.accessor.get(IBrowser);
  }

  get windowManager() {
    return this.accessor.get(IWindowManager);
  }

  get httpServer() {
    return this.accessor.get(ISimpleHttpServer);
  }

  async launch(opts: IApplicationOptions) {
    this.opts = opts;
    if (opts.serverFolder) {
      this.httpServer.serve(opts.serverFolder);
    }
    await this.browserWindow.launch(opts.browserOptions);

    this.browserWindow.onExit(() => {
      this.emit('exit');
    });
  }

  expoFunction(name: string, func: Function) {
    console.log('expoFunction', name, func);
    return this.browserWindow.expoFunction(name, func);
  }

  async load(entry: string) {
    let url;
    if (this.opts.serverFolder) {
      url = this.httpServer.getEntryUrl(entry);
    } else {
      url = this.opts.serverOrigin + entry;
    }
    await this.browserWindow.loadUrl(url);
  }

  async createWindow(url: string, options: IWindowOptions) {
    return await this.windowManager.createWindow(url, options);
  }
}
