import { IpcRequestData, IpcResponseData } from '@/ipc/types';

export enum IPC_PROTOCOL_TYPE {
  request = 'claire_request',
  event = 'claire_event',
}

export function parseIPCMessage(
  protocol: string,
  msg: Record<string, IpcRequestData | IpcResponseData>,
): IpcRequestData | IpcResponseData | null {
  if (typeof msg === 'object' && msg[protocol]) {
    return msg[protocol];
  }
  return null;
}

export function createIPCMessage(
  protocol: string,
  body: IpcRequestData | IpcResponseData,
): Record<string, IpcRequestData | IpcResponseData> {
  return { [protocol]: body };
}
