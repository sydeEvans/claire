import * as child_process from 'child_process';
import * as path from 'path';
import type { IBrowserOptions } from '@/browser/Browser';
import { InstantiationService, ServiceCollection } from '@/common/instantiation';
import { ServicesAccessor } from '@/common/instantiation/instantiationService';
import { IpcClient } from '@/ipc/ipcClient';
import { ChildProcess } from 'child_process';
import { ServiceIdentifier } from '@/common/instantiation/serviceIdentifier';
import { IBrowser } from '@/browser/Browser';

interface Accessor {
  get<T>(id: ServiceIdentifier<T>): T;
}

export class Application {
  private accessor: ServicesAccessor;

  constructor() {
    this.createService();
  }

  createService() {
    const services = new ServiceCollection();

    // register service

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

  get browser() {
    return this.accessor.get(IBrowser);
  }

  async launch(opts: IBrowserOptions) {
    const windowScript = path.join(__dirname, '../browser/index');
    const childProcess = child_process.fork(windowScript, [JSON.stringify(opts)]);
    this.accessor = this.createIpcAccessor(childProcess);

    await this.browser.launch(opts);

    this.browser.logTarget();
  }
}
