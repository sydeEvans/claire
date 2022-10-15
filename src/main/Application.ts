import * as child_process from 'child_process';
import * as path from 'path';
import type { IBrowserOptions } from '@/browser/Browser';
import { InstantiationService, ServiceCollection } from '@/common/instantiation';
import { ServicesAccessor } from '@/common/instantiation/instantiationService';
import { IpcClient } from '@/ipc/ipcClient';
import { ChildProcess } from 'child_process';
import { ServiceIdentifier } from '@/common/instantiation/serviceIdentifier';
import { IBrowser } from '@/browser/Browser';
import { ISimpleHttpServer, SimpleHttpServer } from '@/main/SimpleHttpServer';

interface Accessor {
  get<T>(id: ServiceIdentifier<T>): T;
}

interface IApplicationOptions {
  browserOptions: IBrowserOptions;
  serverFolder: string;
}

export class Application {
  private accessor: ServicesAccessor;
  private ipcAccessor: ServicesAccessor;

  constructor() {
    this.createService();
  }

  createService() {
    const services = new ServiceCollection();

    // register service
    services.set(ISimpleHttpServer, SimpleHttpServer);

    const instantiationService = new InstantiationService(services);
    this.accessor = instantiationService.getAccessor();
  }

  createIpcAccessor(proc: ChildProcess) {
    const ipcClient = new IpcClient(proc);

    const accessor: Accessor = {
      get<T>(id: ServiceIdentifier<T>) {
        const service = new Proxy(
          {},
          {
            get(_, property: string) {
              return (...params: any) => {
                return ipcClient.invoke({
                  service: id.toString(),
                  method: property,
                  args: params,
                });
              };
            },
          },
        );

        return service as T;
      },
    };

    return accessor;
  }

  get browserWindow() {
    return this.ipcAccessor.get(IBrowser);
  }

  get httpServer() {
    return this.accessor.get(ISimpleHttpServer);
  }

  async launch(opts: IApplicationOptions) {
    const windowScript = path.join(__dirname, '../browser/index');
    const childProcess = child_process.fork(windowScript);
    this.ipcAccessor = this.createIpcAccessor(childProcess);

    this.httpServer.serve(opts.serverFolder);

    await this.browserWindow.launch(opts.browserOptions);
  }

  async load(entry) {
    const url = this.httpServer.getEntryUrl(entry);
    await this.browserWindow.loadUrl(url);
  }
}
