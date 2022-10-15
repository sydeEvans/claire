import { IpcRequestData, IpcResponseData } from '@/ipc/types';
import type { ChildProcess } from 'child_process';
import { createIPCMessage, IPC_PROTOCOL_TYPE, parseIPCMessage } from '@/ipc/shared';
import * as uuid from 'uuid';
import { EventEmitter } from 'events';

const RESPONSE_EVENT = 'RESPONSE_EVENT';
const SERVER_EVENT_PUSH = 'SERVER_EVENT_PUSH';

export class IpcClient extends EventEmitter {
  private targetProcess: ChildProcess | NodeJS.Process;

  constructor(targetProcess: ChildProcess | NodeJS.Process) {
    super();
    this.targetProcess = targetProcess;
    // 处理远端的调用响应
    this.targetProcess.on('message', (message: any) => {
      const responseData = parseIPCMessage(IPC_PROTOCOL_TYPE.request, message) as IpcResponseData;
      if (!responseData) {
        // 非法消息
        return;
      }

      // 收到 IpcServer 的响应
      this.emit(RESPONSE_EVENT, responseData);
    });

    // 处理远端的消息通知
    this.targetProcess.on('message', (message: any) => {
      const responseData = parseIPCMessage(IPC_PROTOCOL_TYPE.event, message) as IpcResponseData;
      if (!responseData) {
        // 非法消息
        return;
      }

      this.emit(SERVER_EVENT_PUSH, responseData.payload);
    });
  }

  onServerEvent(callback) {
    this.on(SERVER_EVENT_PUSH, callback);
  }

  invoke(payload: any) {
    return new Promise((resolve, reject) => {
      const id = uuid.v4();
      this.sendMessage({
        id,
        payload,
      });

      // 注册Server端响应
      this.once(RESPONSE_EVENT, (responseData: IpcResponseData) => {
        if (responseData.requestId !== id) return;

        if (responseData.error) {
          reject(responseData.error);
        } else {
          resolve(responseData.payload);
        }
      });
    });
  }

  private sendMessage(message: IpcRequestData) {
    this.targetProcess.send(createIPCMessage(IPC_PROTOCOL_TYPE.request, message));
  }
}
