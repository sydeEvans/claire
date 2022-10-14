import { IpcRequestData, IpcResponseData } from '@/ipc/types';
import type { ChildProcess } from 'child_process';
import { createIPCMessage, parseIPCMessage } from '@/ipc/shared';
import * as uuid from 'uuid';
import { EventEmitter } from 'events';

const RESPONSE_EVENT = 'RESPONSE_EVENT';

export class IpcClient extends EventEmitter {
  private targetProcess: ChildProcess | NodeJS.Process;

  constructor(targetProcess: ChildProcess | NodeJS.Process) {
    super();
    this.targetProcess = targetProcess;
    this.targetProcess.on('message', (message: any) => {
      const responseData = parseIPCMessage(message) as IpcResponseData;
      if (!responseData) {
        // 非法消息
        return;
      }

      // 收到 IpcServer 的响应
      this.emit(RESPONSE_EVENT, responseData);
    });
  }

  invoke(payload: any) {
    return new Promise((resolve, reject) => {
      this.sendMessage({
        id: uuid.v4(),
        payload,
      });

      // 注册Server端响应
      this.once(RESPONSE_EVENT, (responseData: IpcResponseData) => {
        if (responseData.error) {
          reject(responseData.error);
        } else {
          resolve(responseData.payload);
        }
      });
    });
  }

  private sendMessage(message: IpcRequestData) {
    this.targetProcess.send(createIPCMessage(message));
  }
}
