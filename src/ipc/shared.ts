import { IpcRequestData, IpcResponseData } from '@/ipc/types';

const protocol = 'claire-ipc';

export function parseIPCMessage(
  msg: Record<string, IpcRequestData | IpcResponseData>,
): IpcRequestData | IpcResponseData | null {
  if (typeof msg === 'object' && msg[protocol]) {
    return msg[protocol];
  }
  return null;
}

export function createIPCMessage(
  body: IpcRequestData | IpcResponseData,
): Record<string, IpcRequestData | IpcResponseData> {
  return { [protocol]: body };
}
