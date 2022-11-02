export interface IpcRequestData {
  id: string;
  payload: any;
}

export interface IpcResponseData {
  id: string;
  requestId: string;
  payload: any;
  error: any;
}

export interface IpcService {
  on: () => void;
}
