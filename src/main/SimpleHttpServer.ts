import { createDecorator } from '@/common/instantiation/createDecorator';
import Koa from 'koa';
import koaStatic from 'koa-static';

export interface ISimpleHttpServer {
  serve: (folder: string) => void;
  getEntryUrl: (path: string) => string;
}
export const ISimpleHttpServer = createDecorator<ISimpleHttpServer>('ISimpleHttpServer');

export class SimpleHttpServer implements ISimpleHttpServer {
  private innerPort: number = 42000;

  serve(folder) {
    const koa = new Koa();
    koa.use(koaStatic(folder));

    koa.listen(this.innerPort);
  }

  getEntryUrl(path: string) {
    return `http://localhost:${this.innerPort}/${path}`;
  }
}
