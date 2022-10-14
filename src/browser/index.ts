import { ServiceCollection } from '@/common/instantiation/serviceConllection';
import { Browser, IBrowser } from '@/browser/Browser';
import { IWindowManager, WindowManager } from '@/browser/WindowManager';
import { InstantiationService } from '@/common/instantiation';
import { IIpcService, IpcService } from '@/browser/IpcService';

const services = new ServiceCollection();

services.set(IBrowser, Browser);
services.set(IWindowManager, WindowManager);
services.set(IIpcService, IpcService);

const instantiationService = new InstantiationService(services);
const accessor = instantiationService.getAccessor();
const ipcService = accessor.get(IIpcService);

ipcService.init(process);
