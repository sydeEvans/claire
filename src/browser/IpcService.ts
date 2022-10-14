import { createDecorator } from '@/common/instantiation/createDecorator';
import { IBrowser } from '@/browser/Browser';
import { IWindowManager } from '@/browser/WindowManager';
import { IpcServer } from '@/ipc/ipcServer';

export interface IIpcService {
  init: (proc: NodeJS.Process) => IpcServer;
}

export const IIpcService = createDecorator<IIpcService>('ipcService');

export class IpcService implements IIpcService {
  constructor(
    @IBrowser private readonly browser: IBrowser,
    @IWindowManager private readonly windowManager: IWindowManager,
  ) {
    this[IBrowser.toString()] = browser;
    this[IWindowManager.toString()] = windowManager;
  }

  init(proc: NodeJS.Process) {
    return new IpcServer(proc, this._handler.bind(this));
  }

  async _handler(data) {
    const { service, method, args } = data;
    const resp = await this[service][method](...args);
    return resp;
  }
}
