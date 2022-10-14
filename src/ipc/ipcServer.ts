import type { ChildProcess } from 'child_process';
import { createIPCMessage, parseIPCMessage } from '@/ipc/shared';
import { IpcRequestData } from '@/ipc/types';
import * as uuid from 'uuid';

type Handler = (data: any) => Promise<any>;

export class IpcServer {
  private receiveProcess: ChildProcess | NodeJS.Process;

  constructor(receiveProcess: ChildProcess | NodeJS.Process, handler: Handler) {
    this.receiveProcess = receiveProcess;
    this.receiveProcess.on('message', async (message: any) => {
      // 处理消息
      const requestData = parseIPCMessage(message) as IpcRequestData;
      if (!requestData) {
        // 非法消息
        return;
      }

      let error: Error;
      let resp: any;

      try {
        resp = await handler(requestData.payload);
      } catch (err) {
        error = {
          name: err.name || 'IPCError',
          stack: err.stack,
          message: err.message,
        };
      }

      this.receiveProcess.send(
        createIPCMessage({
          id: uuid.v4(),
          requestId: requestData.id,
          payload: resp,
          error,
        }),
      );
    });
  }
}
